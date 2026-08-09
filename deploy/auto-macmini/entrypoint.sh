#!/bin/sh
set -eu

mkdir -p /app/.wrangler
chown -R node:node /app/.wrangler

exec setpriv --reuid=node --regid=node --init-groups "$@"
