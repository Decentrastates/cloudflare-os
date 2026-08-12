#!/usr/bin/env bash

assert_oauth_source_outside_project() {
  local source_file=$1
  local project_root=$2
  local source_real project_real

  source_real=$(cd "$(dirname "$source_file")" && pwd -P)/$(basename "$source_file")
  project_real=$(cd "$project_root" && pwd -P)
  case "$source_real" in
    "$project_real"|"$project_real"/*)
      echo "OAuth environment file must be outside the project directory." >&2
      return 1
      ;;
  esac
}

install_oauth_env() {
  local source_file=$1
  local destination=$2
  local destination_dir
  destination_dir=$(dirname "$destination")

  mkdir -p "$destination_dir"
  chmod 700 "$destination_dir"
  if [ -f "$destination" ]; then
    cp -p "$destination" "$destination.rollback"
    chmod 600 "$destination.rollback"
  else
    rm -f "$destination.rollback"
  fi
  cp "$source_file" "$destination.tmp"
  chmod 600 "$destination.tmp"
  mv -f "$destination.tmp" "$destination"
}

restore_oauth_env() {
  local destination=$1
  if [ -f "$destination.rollback" ]; then
    mv -f "$destination.rollback" "$destination"
    chmod 600 "$destination"
  else
    rm -f "$destination"
  fi
}
