#!/bin/sh

set -eu

backup_root="${PORTFOLIO_BACKUP_DIR:-/var/backups/photography-portfolio}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
database_backup="${backup_root}/postgres-${timestamp}.dump"
uploads_backup="${backup_root}/uploads-${timestamp}.tar.gz"

umask 077
mkdir -p "${backup_root}"

docker inspect photography-portfolio-postgres-1 >/dev/null
docker inspect photography-portfolio-cms-1 >/dev/null

docker exec photography-portfolio-postgres-1 sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  > "${database_backup}"

docker exec photography-portfolio-cms-1 \
  tar -czf - -C /app/public/uploads . \
  > "${uploads_backup}"

test -s "${database_backup}"
test -s "${uploads_backup}"

sha256sum "${database_backup}" "${uploads_backup}" > "${backup_root}/checksums-${timestamp}.sha256"

find "${backup_root}" -type f -mtime +30 -delete

printf 'Backup created: %s\n' "${timestamp}"
