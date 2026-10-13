#!/usr/bin/env bash
# Deploy the latest code from GitHub and (re)start the stack.
#
#   cd /opt/urbanfruto && ./deploy/deploy.sh            # deploys branch "main"
#   BRANCH=staging ./deploy/deploy.sh                   # another branch
#
# Safe to run any time: MongoDB data and HTTPS certificates live in Docker
# volumes and survive rebuilds. The server's .env is untracked and never touched.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${BRANCH:-main}"
cd "$APP_DIR"

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

# --- Preflight -----------------------------------------------------------
command -v docker >/dev/null || die "Docker is not installed."
docker compose version >/dev/null 2>&1 || die "Docker Compose plugin is missing."
[ -f .env ] || die ".env not found. Run: cp .env.example .env && nano .env"

set -a; source .env; set +a
for var in DOMAIN ACME_EMAIL MONGO_USER MONGO_PASSWORD JWT_SECRET \
           R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET R2_PUBLIC_URL; do
  [ -n "${!var:-}" ] || die "$var is empty in .env"
done

# --- Update code ---------------------------------------------------------
log "Fetching $BRANCH from GitHub"
git fetch --prune origin
git checkout "$BRANCH"
# --ff-only refuses to deploy if someone edited tracked files on the server.
git pull --ff-only origin "$BRANCH"
log "Deploying commit $(git log -1 --format='%h %s')"

# --- Build and start -----------------------------------------------------
log "Building images"
docker compose build --pull

log "Starting containers"
docker compose up -d --remove-orphans

log "Removing old images"
docker image prune -f >/dev/null

# --- Health checks -------------------------------------------------------
log "Waiting for the backend"
for i in $(seq 1 30); do
  if docker compose exec -T backend python -c \
      "import urllib.request; urllib.request.urlopen('http://localhost:8001/api/', timeout=3)" 2>/dev/null; then
    echo "Backend is up."
    break
  fi
  [ "$i" -eq 30 ] && { docker compose logs --tail 50 backend; die "Backend did not start."; }
  sleep 2
done

log "Checking https://$DOMAIN"
if curl -fsS --max-time 10 "https://$DOMAIN/api/" >/dev/null 2>&1; then
  echo "Site is live at https://$DOMAIN"
else
  echo "HTTPS is not answering yet. On a first deploy the certificate can take a minute."
  echo "Check with: docker compose logs -f web"
fi

docker compose ps

if [ "$(docker compose exec -T backend python -c "import os; from pymongo import MongoClient; print(MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']].admins.count_documents({}))" 2>/dev/null)" = "0" ]; then
  printf '\n\033[1;33mNo admin user yet. Create one with:\n  docker compose exec backend python scripts/create_admin.py you@example.com\033[0m\n'
fi
