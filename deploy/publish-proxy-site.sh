#!/bin/sh

set -eu

script_directory="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
sites_directory="${PROXY_SITES_DIRECTORY:-/opt/fabrun/deploy/sites}"
proxy_container="${PROXY_CONTAINER:-deploy-web-1}"
site_file="${sites_directory}/portfolio.caddy"
backup_file="${site_file}.previous"

reload_proxy() {
    docker exec "${proxy_container}" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
}

if [ ! -d "${sites_directory}" ]; then
    echo "Proxy sites directory ${sites_directory} not found." >&2
    exit 1
fi

if [ -f "${site_file}" ]; then
    cp "${site_file}" "${backup_file}"
fi

cp "${script_directory}/Caddyfile.portfolio" "${site_file}.tmp"
mv "${site_file}.tmp" "${site_file}"

# Caddy keeps its running configuration when a reload fails, but the file on disk would
# break the next proxy restart, so restore the previous version.
if ! reload_proxy; then
    if [ -f "${backup_file}" ]; then
        mv "${backup_file}" "${site_file}"
    else
        rm -f "${site_file}"
    fi
    echo "Proxy rejected Caddyfile.portfolio; previous site configuration restored." >&2
    exit 1
fi

rm -f "${backup_file}"
