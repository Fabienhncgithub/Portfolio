#!/bin/sh

set -eu

script_directory="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
project_directory="$(dirname "${script_directory}")"
environment_file="${script_directory}/.env.production"
compose_file="${script_directory}/compose.yaml"

cd "${project_directory}"

docker compose --env-file "${environment_file}" -f "${compose_file}" config --quiet
"${script_directory}/backup-production.sh"
docker compose --env-file "${environment_file}" -f "${compose_file}" up -d --build
docker compose --env-file "${environment_file}" -f "${compose_file}" ps
