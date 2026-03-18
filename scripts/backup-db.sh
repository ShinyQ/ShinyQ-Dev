#!/bin/bash
# PostgreSQL backup script
# Usage: ./scripts/backup-db.sh
# Recommended: run via cron daily
#   0 2 * * * /home/ShinyQ-Dev/scripts/backup-db.sh

set -euo pipefail

BACKUP_DIR="/backups/postgres"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/pg-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL backup..."
docker exec minerva-postgres pg_dumpall -U "${POSTGRES_USER:-shinyq}" | gzip > "${BACKUP_FILE}"
echo "[$(date)] Backup saved to ${BACKUP_FILE}"

# Remove backups older than retention period
find "${BACKUP_DIR}" -name "pg-*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Cleaned up backups older than ${RETENTION_DAYS} days"
