#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_TARGET="${DEPLOY_TARGET:-cddao@100.96.0.6}"
DEPLOY_JUMP="${DEPLOY_JUMP:-Kuaixiong01}"
REMOTE_BASE="${REMOTE_BASE:-/home/cddao/Projects/cloudflare-os}"
COMPOSE_FILE="deploy/apps/compose.yml"
HEALTH_URL="http://10.168.10.101:8787/"
REVISION="$(git -C "$PROJECT_ROOT" rev-parse HEAD)"
RELEASE_ID="$REVISION-$(date -u +%Y%m%dT%H%M%SZ)"
REMOTE_RELEASE="$REMOTE_BASE/releases/$RELEASE_ID"
REMOTE_SHARED="$REMOTE_BASE/shared"
BUILD_CONTEXT="$(mktemp -d "${TMPDIR:-/tmp}/cloudflare-os-apps.XXXXXX")"
IMAGE_ARCHIVE="$BUILD_CONTEXT/cloudflare-os-apps.tar"

cleanup() {
  rm -rf "$BUILD_CONTEXT"
}
trap cleanup EXIT

if [ "$(git -C "$PROJECT_ROOT" branch --show-current)" != "develop" ]; then
  echo "Refusing deployment: the governed branch is develop." >&2
  exit 1
fi
if [ -n "$(git -C "$PROJECT_ROOT" status --porcelain)" ]; then
  echo "Refusing deployment: the develop worktree must be clean." >&2
  exit 1
fi

SSH=(ssh -o BatchMode=yes -J "$DEPLOY_JUMP" "$DEPLOY_TARGET")

"${SSH[@]}" "bash -s" <<'REMOTE_PREFLIGHT'
set -euo pipefail

available_kib=$(awk '/MemAvailable:/ {print $2}' /proc/meminfo)
available_disk_kib=$(df -Pk /home | awk 'NR == 2 {print $4}')
if [ "${available_kib:-0}" -lt 12582912 ]; then
  echo "Refusing deployment: apps has less than 12 GiB available memory." >&2
  exit 1
fi
if [ "${available_disk_kib:-0}" -lt 20971520 ]; then
  echo "Refusing deployment: apps has less than 20 GiB available disk." >&2
  exit 1
fi

for container in auto-postgres auto-odoo auto-c-frontend auto-b-frontend; do
  state=$(docker inspect "$container" --format '{{.State.Status}}' 2>/dev/null || true)
  health=$(docker inspect "$container" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  if [ "$state" != running ] || { [ "$health" != none ] && [ "$health" != healthy ]; }; then
    echo "Refusing deployment: protected Auto container $container is not healthy." >&2
    exit 1
  fi
done

for url in \
  http://10.168.10.101:7069/web/health \
  http://10.168.10.101:6001/ \
  http://10.168.10.101:6002/; do
  if ! curl -fsS --connect-timeout 3 --max-time 10 "$url" >/dev/null; then
    echo "Refusing deployment: protected Auto endpoint $url is unavailable." >&2
    exit 1
  fi
done

port_owner=$(docker ps --filter publish=8787 --format '{{.Names}}' | head -1)
if [ -n "$port_owner" ] && [ "$port_owner" != cloudflare-os-apps ]; then
  echo "Refusing deployment: port 8787 is owned by $port_owner." >&2
  exit 1
fi
REMOTE_PREFLIGHT

git -C "$PROJECT_ROOT" archive HEAD | tar -x -C "$BUILD_CONTEXT"
docker buildx build \
  --platform linux/amd64 \
  --file "$BUILD_CONTEXT/deploy/auto-macmini/Dockerfile" \
  --tag "cloudflare-os-apps:$REVISION" \
  --output "type=docker,dest=$IMAGE_ARCHIVE" \
  "$BUILD_CONTEXT"

"${SSH[@]}" "test ! -e '$REMOTE_RELEASE' && mkdir -p '$REMOTE_RELEASE' '$REMOTE_SHARED' && chmod 700 '$REMOTE_SHARED'"

rsync -az \
  -e "ssh -o BatchMode=yes -J $DEPLOY_JUMP" \
  --exclude cloudflare-os-apps.tar \
  "$BUILD_CONTEXT/" "$DEPLOY_TARGET:$REMOTE_RELEASE/"

rsync -az \
  -e "ssh -o BatchMode=yes -J $DEPLOY_JUMP" \
  "$IMAGE_ARCHIVE" "$DEPLOY_TARGET:$REMOTE_SHARED/$RELEASE_ID.tar"

"${SSH[@]}" "bash -s" -- \
  "$REMOTE_RELEASE" "$REMOTE_SHARED" "$COMPOSE_FILE" "$HEALTH_URL" "$REVISION" "$RELEASE_ID" <<'REMOTE_DEPLOY'
set -euo pipefail
release=$1
shared=$2
compose_file=$3
health_url=$4
revision=$5
release_id=$6
runtime_env="$shared/runtime.env"
credentials="$shared/admin-credentials"
image_archive="$shared/$release_id.tar"
bootstrap_complete="$shared/bootstrap-complete"
bootstrap_pending="$shared/bootstrap-pending"

legacy_deployment=false
if docker container inspect cloudflare-os-apps >/dev/null 2>&1 || \
    [ -L "$shared/current-release" ]; then
  legacy_deployment=true
fi

if [ ! -f "$credentials" ]; then
  umask 077
  suffix=$(openssl rand -hex 8)
  password=$(openssl rand -base64 30 | tr -d '\n')
  printf 'CLOUDFLARE_OS_BOOTSTRAP_USERNAME=cfos_admin_%s\nCLOUDFLARE_OS_BOOTSTRAP_PASSWORD=%s\n' \
    "$suffix" "$password" > "$credentials"
fi

set -a
# shellcheck disable=SC1090
. "$credentials"
set +a
printf 'CLOUDFLARE_OS_ADMINS=["%s"]\n' "$CLOUDFLARE_OS_BOOTSTRAP_USERNAME" > "$runtime_env"
chmod 600 "$credentials" "$runtime_env"

cd "$release"
compose=(docker compose --env-file "$runtime_env" -f "$compose_file")

current_health=none
if docker container inspect cloudflare-os-apps >/dev/null 2>&1; then
  current_health=$(docker inspect cloudflare-os-apps --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}')
fi
if [ "$current_health" = healthy ]; then
  running_image=$(docker inspect cloudflare-os-apps --format '{{.Image}}')
  docker tag "$running_image" cloudflare-os-apps:rollback
fi

docker load --input "$image_archive"
rm -f "$image_archive"
docker tag "cloudflare-os-apps:$revision" cloudflare-os-apps:latest

wait_for_health() {
  for _ in $(seq 1 30); do
    container_health=$(docker inspect cloudflare-os-apps \
      --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
    if [ "$container_health" = healthy ] && \
        curl -fsS --connect-timeout 3 --max-time 10 "$health_url" >/dev/null; then
      return 0
    fi
    sleep 5
  done
  return 1
}

rollback() {
  "${compose[@]}" down || true
  if docker image inspect cloudflare-os-apps:rollback >/dev/null 2>&1; then
    docker tag cloudflare-os-apps:rollback cloudflare-os-apps:latest
    "${compose[@]}" up -d --no-build
    if ! wait_for_health; then
      echo "Rollback image failed its health gate." >&2
      return 1
    fi
    echo "Previous Cloudflare OS image restored and verified." >&2
  else
    echo "First deployment failed; the unhealthy stack was removed." >&2
  fi
}

"${compose[@]}" up -d --no-build

if ! wait_for_health; then
  "${compose[@]}" logs --tail=200
  rollback
  exit 1
fi

volume_identity=$(docker volume inspect cloudflare-os-apps-data --format '{{.CreatedAt}}')
complete_identity=$(cat "$bootstrap_complete" 2>/dev/null || true)
pending_identity=$(cat "$bootstrap_pending" 2>/dev/null || true)
bootstrap_state=$(node deploy/apps/bootstrap-policy.mjs \
  "$volume_identity" "$complete_identity" "$pending_identity" "$legacy_deployment")
case "$bootstrap_state" in
  existing)
    fresh_bootstrap=false
    ;;
  legacy)
    # Bind the migration marker to this exact pre-marker Docker volume.
    umask 077
    printf '%s\n' "$volume_identity" > "$bootstrap_complete.tmp"
    mv -f "$bootstrap_complete.tmp" "$bootstrap_complete"
    fresh_bootstrap=false
    ;;
  fresh)
    umask 077
    printf '%s\n' "$volume_identity" > "$bootstrap_pending"
    fresh_bootstrap=true
    ;;
  *)
    echo "Unknown bootstrap state: $bootstrap_state" >&2
    rollback
    exit 1
    ;;
esac

if ! timeout --signal=TERM 45s docker exec \
  -e CLOUDFLARE_OS_BOOTSTRAP_USERNAME="$CLOUDFLARE_OS_BOOTSTRAP_USERNAME" \
  -e CLOUDFLARE_OS_BOOTSTRAP_PASSWORD="$CLOUDFLARE_OS_BOOTSTRAP_PASSWORD" \
  -e CLOUDFLARE_OS_FRESH_BOOTSTRAP="$fresh_bootstrap" \
  cloudflare-os-apps node deploy/apps/bootstrap-admin.mjs; then
  rollback
  exit 1
fi
if [ "$fresh_bootstrap" = true ]; then
  mv -f "$bootstrap_pending" "$bootstrap_complete"
  chmod 600 "$bootstrap_complete"
fi

for container in auto-postgres auto-odoo auto-c-frontend auto-b-frontend; do
  state=$(docker inspect "$container" --format '{{.State.Status}}' 2>/dev/null || true)
  health=$(docker inspect "$container" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  if [ "$state" != running ] || { [ "$health" != none ] && [ "$health" != healthy ]; }; then
    echo "Protected Auto container $container failed after deployment; rolling back." >&2
    rollback
    exit 1
  fi
done

for url in \
  http://10.168.10.101:7069/web/health \
  http://10.168.10.101:6001/ \
  http://10.168.10.101:6002/; do
  if ! curl -fsS --connect-timeout 3 --max-time 10 "$url" >/dev/null; then
    echo "Protected Auto endpoint $url failed after deployment; rolling back." >&2
    rollback
    exit 1
  fi
done

ln -sfn "$release" "$shared/current-release"
"${compose[@]}" ps
curl -fsS -I --connect-timeout 3 --max-time 10 "$health_url" | sed -n '1,8p'
echo "Application phase healthy; edge activation is still pending."
REMOTE_DEPLOY

echo "Cloudflare OS application phase is healthy on apps at $HEALTH_URL"
echo "Final success still requires Nginx, DNS, TLS, and HTTPS health verification."
