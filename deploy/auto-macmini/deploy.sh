#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_TARGET="${DEPLOY_TARGET:-aos@192.168.3.36}"
REMOTE_DIRECTORY="${REMOTE_DIRECTORY:-/Users/aos/cloudflare-os}"
LOCAL_OAUTH_ENV_FILE="${OAUTH_ENV_FILE:-}"
REMOTE_OAUTH_ENV_FILE="${REMOTE_OAUTH_ENV_FILE:-/Users/aos/.config/bug-os/auto-macmini-oauth.env}"
OAUTH_UPLOAD_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
NO_OAUTH_UPDATE="__NO_OAUTH_UPDATE__"
REMOTE_OAUTH_INCOMING="$NO_OAUTH_UPDATE"
oauth_upload_pending=false
COMPOSE_FILE="deploy/auto-macmini/compose.yml"

cleanup_remote_incoming() {
  if [ "$oauth_upload_pending" = true ]; then
    ssh -o BatchMode=yes "$DEPLOY_TARGET" \
      "rm -f '$REMOTE_OAUTH_INCOMING'" >/dev/null 2>&1 || true
  fi
}
trap cleanup_remote_incoming EXIT

# shellcheck source=../oauth-env.sh
. "$PROJECT_ROOT/deploy/oauth-env.sh"

if [ -n "$LOCAL_OAUTH_ENV_FILE" ] && [ ! -f "$LOCAL_OAUTH_ENV_FILE" ]; then
  echo "OAuth environment file not found: $LOCAL_OAUTH_ENV_FILE" >&2
  exit 1
fi
if [ -n "$LOCAL_OAUTH_ENV_FILE" ]; then
  assert_oauth_source_outside_project "$LOCAL_OAUTH_ENV_FILE" "$PROJECT_ROOT"
fi

ssh -o BatchMode=yes "$DEPLOY_TARGET" "mkdir -p '$REMOTE_DIRECTORY'"

rsync -az \
  --exclude .git \
  --exclude .worktrees \
  --exclude .wrangler \
  --exclude '.dev.vars*' \
  --exclude '.env*' \
  --exclude node_modules \
  --exclude '*/node_modules' \
  --exclude '*/dist' \
  "$PROJECT_ROOT/" "$DEPLOY_TARGET:$REMOTE_DIRECTORY/"

if [ -n "$LOCAL_OAUTH_ENV_FILE" ]; then
  remote_oauth_dir="$(dirname "$REMOTE_OAUTH_ENV_FILE")"
  REMOTE_OAUTH_INCOMING="$REMOTE_OAUTH_ENV_FILE.incoming.$OAUTH_UPLOAD_ID"
  ssh -o BatchMode=yes "$DEPLOY_TARGET" "mkdir -p '$remote_oauth_dir' && chmod 700 '$remote_oauth_dir'"
  rsync -az "$LOCAL_OAUTH_ENV_FILE" "$DEPLOY_TARGET:$REMOTE_OAUTH_INCOMING"
  oauth_upload_pending=true
  ssh -o BatchMode=yes "$DEPLOY_TARGET" "chmod 600 '$REMOTE_OAUTH_INCOMING'"
fi

ssh -o BatchMode=yes "$DEPLOY_TARGET" "bash -s" -- \
  "$REMOTE_DIRECTORY" "$REMOTE_OAUTH_ENV_FILE" "$COMPOSE_FILE" \
  "$REMOTE_OAUTH_INCOMING" <<'REMOTE_DEPLOY'
set -eEuo pipefail
remote_directory=$1
oauth_env=$2
compose_file=$3
oauth_incoming=$4
if [ "$oauth_incoming" = __NO_OAUTH_UPDATE__ ]; then
  oauth_incoming=""
fi
cleanup_incoming() {
  if [ -n "$oauth_incoming" ]; then
    rm -f "$oauth_incoming"
  fi
}
trap cleanup_incoming EXIT
export PATH=/usr/local/bin:/usr/bin:/bin
export CLOUDFLARE_OS_OAUTH_ENV_FILE="$oauth_env"
cd "$remote_directory"
. deploy/oauth-env.sh
oauth_changed=false
rollback_ready=false
stack_replaced=false

wait_for_health() {
  for _ in $(seq 1 30); do
    container_health=$(docker inspect cloudflare-os \
      --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
    if [ "$container_health" = healthy ] && \
        curl -fsS --connect-timeout 3 --max-time 10 http://127.0.0.1:8787/ >/dev/null; then
      return 0
    fi
    sleep 5
  done
  return 1
}

rollback_deployment() {
  status=$?
  trap - ERR
  set +e
  if [ "$oauth_changed" = true ]; then
    restore_oauth_env "$oauth_env"
  fi
  cleanup_incoming
  if [ "$rollback_ready" = true ] && \
      docker image inspect cloudflare-os-local:rollback >/dev/null 2>&1; then
    if [ "$stack_replaced" = true ]; then
      docker compose -f "$compose_file" down
    fi
    docker tag cloudflare-os-local:rollback cloudflare-os-local:latest
    docker compose -f "$compose_file" up -d --no-build
    if ! wait_for_health; then
      echo 'Rollback image failed its health gate.' >&2
    fi
  fi
  exit "$status"
}
trap rollback_deployment ERR

if [ -n "$oauth_incoming" ] && [ -f "$oauth_incoming" ]; then
  oauth_changed=true
  install_oauth_env "$oauth_incoming" "$oauth_env"
  cleanup_incoming
fi

current_health=none
if docker container inspect cloudflare-os >/dev/null 2>&1; then
  current_health=$(docker inspect cloudflare-os --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}')
fi
if [ "$current_health" = healthy ] && \
    docker image inspect cloudflare-os-local:latest >/dev/null 2>&1; then
  docker tag cloudflare-os-local:latest cloudflare-os-local:rollback
  rollback_ready=true
fi

docker compose -f "$compose_file" build
stack_replaced=true
docker compose -f "$compose_file" up -d

if ! wait_for_health; then
  docker compose -f "$compose_file" logs --tail=200
  false
fi

trap - ERR
if [ "$oauth_changed" = true ]; then
  rm -f "$oauth_env.rollback"
fi
docker compose -f "$compose_file" ps
REMOTE_DEPLOY

curl -fsS --connect-timeout 3 --max-time 10 "http://192.168.3.36:8787/" >/dev/null
echo "Bug OS is available at http://192.168.3.36:8787/"
