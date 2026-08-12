#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=oauth-env.sh
. "$ROOT/deploy/oauth-env.sh"

tmp=$(mktemp -d "${TMPDIR:-/tmp}/bug-os-oauth-env-test.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/project" "$tmp/external"
printf 'GITHUB_CLIENT_ID=inside\n' > "$tmp/project/oauth.env"
printf 'GITHUB_CLIENT_ID=first\n' > "$tmp/external/first.env"
printf 'GITHUB_CLIENT_ID=second\n' > "$tmp/external/second.env"

if assert_oauth_source_outside_project "$tmp/project/oauth.env" "$tmp/project" 2>/dev/null; then
  echo "project-local OAuth source was accepted" >&2
  exit 1
fi
assert_oauth_source_outside_project "$tmp/external/first.env" "$tmp/project"

destination="$tmp/remote/oauth.env"
install_oauth_env "$tmp/external/first.env" "$destination"
test "$(stat -f '%Lp' "$destination" 2>/dev/null || stat -c '%a' "$destination")" = 600
install_oauth_env "$tmp/external/second.env" "$destination"
grep -q 'second' "$destination"
grep -q 'first' "$destination.rollback"
restore_oauth_env "$destination"
grep -q 'first' "$destination"
test ! -e "$destination.rollback"

rm -f "$destination"
install_oauth_env "$tmp/external/second.env" "$destination"
restore_oauth_env "$destination"
test ! -e "$destination"

install_oauth_env "$tmp/external/first.env" "$destination"
set +e
(
  set -eE
  changed=false
  rollback_on_error() {
    status=$?
    trap - ERR
    set +e
    if [ "$changed" = true ]; then
      restore_oauth_env "$destination"
    fi
    exit "$status"
  }
  trap rollback_on_error ERR
  changed=true
  install_oauth_env "$tmp/external/second.env" "$destination"
  false
)
fault_status=$?
set -e
test "$fault_status" -ne 0
grep -q 'first' "$destination"
test ! -e "$destination.rollback"

echo "oauth env lifecycle passed"
