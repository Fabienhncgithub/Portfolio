#!/bin/sh

set -eu

revision="${1:?A validated Git commit SHA is required.}"
script_directory="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
project_directory="$(dirname "${script_directory}")"
environment_file="${script_directory}/.env.development"
compose_file="${script_directory}/compose.development.yaml"

case "${revision}" in
  *[!0-9a-f]* | "")
    printf 'Invalid Git commit SHA.\n' >&2
    exit 1
    ;;
esac

if [ "${#revision}" -ne 40 ]; then
  printf 'The Git commit SHA must contain exactly 40 characters.\n' >&2
  exit 1
fi

cd "${project_directory}"

if ! git diff --quiet || ! git diff --cached --quiet; then
  printf 'The development worktree contains uncommitted changes.\n' >&2
  exit 1
fi

test -f "${environment_file}"
docker network inspect photography-edge >/dev/null

git fetch --prune origin develop
git cat-file -e "${revision}^{commit}"
git checkout --detach "${revision}"

docker compose --env-file "${environment_file}" -f "${compose_file}" config --quiet
docker compose --env-file "${environment_file}" -f "${compose_file}" up -d --build
"${script_directory}/refresh-content.sh" "${environment_file}" "${compose_file}"
docker compose --env-file "${environment_file}" -f "${compose_file}" ps
