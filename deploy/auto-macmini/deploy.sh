#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_TARGET="${DEPLOY_TARGET:-aos@192.168.3.36}"
REMOTE_DIRECTORY="${REMOTE_DIRECTORY:-/Users/aos/cloudflare-os}"
COMPOSE_FILE="deploy/auto-macmini/compose.yml"

ssh -o BatchMode=yes "$DEPLOY_TARGET" "mkdir -p '$REMOTE_DIRECTORY'"

rsync -az \
  --exclude .git \
  --exclude .wrangler \
  --exclude '.dev.vars*' \
  --exclude '.env*' \
  --exclude node_modules \
  --exclude '*/node_modules' \
  --exclude '*/dist' \
  "$PROJECT_ROOT/" "$DEPLOY_TARGET:$REMOTE_DIRECTORY/"

ssh -o BatchMode=yes "$DEPLOY_TARGET" "
  set -e
  export PATH=/usr/local/bin:/usr/bin:/bin
  cd '$REMOTE_DIRECTORY'

  current_health=none
  if docker container inspect cloudflare-os >/dev/null 2>&1; then
    current_health=\$(docker inspect cloudflare-os --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}')
  fi
  if [ \"\$current_health\" = healthy ] && \
      docker image inspect cloudflare-os-local:latest >/dev/null 2>&1; then
    docker tag cloudflare-os-local:latest cloudflare-os-local:rollback
  fi

  docker compose -f '$COMPOSE_FILE' build
  docker compose -f '$COMPOSE_FILE' up -d

  healthy=0
  for attempt in \$(seq 1 30); do
    container_health=\$(docker inspect cloudflare-os \
      --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
    if [ \"\$container_health\" = healthy ] && \
        curl -fsS http://127.0.0.1:8787/ >/dev/null; then
      healthy=1
      break
    fi
    sleep 5
  done

  if [ \"\$healthy\" -ne 1 ]; then
    docker compose -f '$COMPOSE_FILE' logs --tail=200
    if docker image inspect cloudflare-os-local:rollback >/dev/null 2>&1; then
      docker compose -f '$COMPOSE_FILE' down
      docker tag cloudflare-os-local:rollback cloudflare-os-local:latest
      docker compose -f '$COMPOSE_FILE' up -d --no-build
    fi
    exit 1
  fi

  docker compose -f '$COMPOSE_FILE' ps
"

curl -fsS "http://192.168.3.36:8787/" >/dev/null
echo "Bug OS is available at http://192.168.3.36:8787/"
