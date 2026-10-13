#!/usr/bin/env bash
# Daily MongoDB backup. Keeps the last 14 dumps in /opt/urbanfruto-backups.
# Cron (as root): 30 2 * * * /opt/urbanfruto/deploy/backup-mongo.sh >> /var/log/urbanfruto-backup.log 2>&1
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR=/opt/urbanfruto-backups
KEEP=14

cd "$APP_DIR"
set -a; source .env; set +a

mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/mongo-$(date +%F-%H%M).archive.gz"

docker compose exec -T mongo mongodump \
  --username "$MONGO_USER" --password "$MONGO_PASSWORD" --authenticationDatabase admin \
  --db "${DB_NAME:-urbanfruto}" --archive --gzip > "$file"

ls -1t "$BACKUP_DIR"/mongo-*.archive.gz | tail -n +$((KEEP + 1)) | xargs -r rm --
echo "$(date -Is) backup ok: $file ($(du -h "$file" | cut -f1))"
