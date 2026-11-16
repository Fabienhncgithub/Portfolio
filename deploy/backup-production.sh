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
  tar -czf - -C /app/cms/public/uploads . \
  > "${uploads_backup}"

test -s "${database_backup}"
test -s "${uploads_backup}"

sha256sum "${database_backup}" "${uploads_backup}" > "${backup_root}/checksums-${timestamp}.sha256"

find "${backup_root}" -type f -mtime +30 -delete

# Optional off-site copy: local backups do not survive the loss of this server.
# PORTFOLIO_BACKUP_REMOTE is an rclone destination such as "b2:my-bucket/portfolio".
# "copy" never deletes on the remote, so set retention with a bucket lifecycle rule.
if [ -n "${PORTFOLIO_BACKUP_REMOTE:-}" ]; then
  if ! command -v rclone >/dev/null 2>&1; then
    echo "PORTFOLIO_BACKUP_REMOTE is set but rclone is not installed." >&2
    exit 1
  fi

  rclone copy "${backup_root}" "${PORTFOLIO_BACKUP_REMOTE}" \
    --include "*-${timestamp}.*" --checksum
  printf 'Off-site copy sent to %s\n' "${PORTFOLIO_BACKUP_REMOTE}"
else
  echo "Warning: PORTFOLIO_BACKUP_REMOTE is not set; this backup only exists on this server." >&2
fi

printf 'Backup created: %s\n' "${timestamp}"
