# Deploying Urban Fruto (Hostinger VPS, Ubuntu 26.04)

One VPS runs everything with Docker Compose:

| Service | What it does | Exposed |
|---|---|---|
| `web` (Caddy) | Serves the React build, proxies `/api` to the backend, automatic HTTPS | 80, 443 |
| `backend` | FastAPI app | internal only |
| `mongo` | MongoDB 7 with a password, data in a Docker volume | internal only |

Images are served from Cloudflare R2.

---

## One-time setup

### 1. Point urbanfruto.com at the VPS

hPanel → **Domains → urbanfruto.com → DNS / Nameservers → DNS records**:

1. Delete any existing **A**, **AAAA** or **CNAME** records for `@` and `www` (Hostinger's parking page).
2. Add:

| Type | Name | Points to | TTL |
|---|---|---|---|
| A | `@` | `<VPS IP>` | 300 |
| A | `www` | `<VPS IP>` | 300 |

Check from your Mac until both show the VPS IP (can take 5–30 min):

```bash
dig +short urbanfruto.com
dig +short www.urbanfruto.com
```

### 2. Check Docker on the server

```bash
docker --version && docker compose version
```

If either fails (the get.docker.com script may not support a brand-new Ubuntu release yet), install Ubuntu's own packages:

```bash
apt install -y docker.io docker-compose-v2 && systemctl enable --now docker
```

### 3. Check GitHub access from the server

The deploy key must be generated **on the server** (`ssh-keygen` run while SSH'd in), and its **public** part (`cat ~/.ssh/id_ed25519.pub`) added under GitHub → repo → Settings → Deploy keys.

```bash
ssh -T git@github.com
# Expected: "Hi DadhichVipin/urbanfruto! You've successfully authenticated..."
```

### 4. Clone the repo

```bash
git clone git@github.com:DadhichVipin/urbanfruto.git /opt/urbanfruto
cd /opt/urbanfruto
```

### 5. Create the server's .env (database + secrets)

```bash
cp .env.example .env
echo "MONGO_PASSWORD=$(openssl rand -hex 24)"
echo "JWT_SECRET=$(openssl rand -hex 32)"
nano .env
chmod 600 .env
```

Fill in:

| Key | Value |
|---|---|
| `DOMAIN` | `urbanfruto.com` |
| `ACME_EMAIL` | your email (Let's Encrypt expiry notices) |
| `MONGO_USER` | `urbanfruto` |
| `MONGO_PASSWORD` | the generated value |
| `DB_NAME` | `urbanfruto` |
| `JWT_SECRET` | the generated value |
| `R2_*` | **new** R2 keys (rotate the ones used during development) |
| `SLACK_WEBHOOK_URL` | optional |

**About the database:** there is nothing else to install. On the first deploy, Docker starts MongoDB, creates the
`MONGO_USER` account with `MONGO_PASSWORD`, and the backend seeds the hampers, fruits and site settings automatically.
MongoDB is only reachable by the backend inside Docker, never from the internet.

> `MONGO_USER` / `MONGO_PASSWORD` are applied only when the database volume is first created.
> Changing them later in `.env` does not change the existing database user.

### 6. First deploy

```bash
./deploy/deploy.sh
```

The first build takes a few minutes. Then open **https://urbanfruto.com**.

### 7. Create your admin account

Admins are never stored in `.env`. Create yours on the server (you'll be asked for the password, which isn't echoed or saved in shell history):

```bash
docker compose exec backend python scripts/create_admin.py you@example.com
```

Password rules: at least 12 characters, upper- and lower-case letters and a number.
Then log in at **https://urbanfruto.com/admin/login**. The admin panel isn't linked anywhere on the site, so bookmark it.

### 8. Daily database backups

```bash
crontab -e
# add this line:
30 2 * * * /opt/urbanfruto/deploy/backup-mongo.sh >> /var/log/urbanfruto-backup.log 2>&1
```

Dumps go to `/opt/urbanfruto-backups` and the last 14 are kept.

---

## Deploying updates

Push to `main` from your Mac, then on the server:

```bash
cd /opt/urbanfruto && ./deploy/deploy.sh
```

The script checks `.env`, pulls the latest code, rebuilds, restarts, removes old images and checks the site is up.
Use `BRANCH=other-branch ./deploy/deploy.sh` to deploy a different branch.

---

## Admin users

```bash
cd /opt/urbanfruto
docker compose exec backend python scripts/create_admin.py you@example.com          # create, or reset a password
docker compose exec backend python scripts/create_admin.py --list                   # list admins and last login
docker compose exec backend python scripts/create_admin.py --delete old@example.com # remove an admin
```

Resetting a password logs that admin out on every device. The last admin can't be deleted.

### How the admin panel is protected

- **Session:** an httpOnly, Secure, SameSite=Strict cookie that page scripts can't read. It expires after 12 hours.
- **Brute force:** 5 wrong passwords for one email, or 20 from one IP, lock login for 15 minutes. Failed attempts are logged (`docker compose logs backend | grep "Failed admin login"`).
- **No credentials in files:** admins live only in the database, with bcrypt-hashed passwords.
- **Hidden:** no links to the admin panel, `noindex` for search engines, and the API docs are disabled.
- **Browser protections:** Content-Security-Policy (only the site's own scripts run), HSTS, and clickjacking protection.

## Restore a backup

```bash
cd /opt/urbanfruto && set -a && . ./.env && set +a
docker compose exec -T mongo mongorestore --username "$MONGO_USER" --password "$MONGO_PASSWORD" \
  --authenticationDatabase admin --archive --gzip --drop < /opt/urbanfruto-backups/<file>.archive.gz
```

## Useful commands

```bash
docker compose ps                        # status
docker compose logs -f backend           # API logs
docker compose logs -f web               # Caddy / HTTPS logs
docker compose restart backend           # restart one service
docker system prune -f                   # free disk space
```

Never run `docker compose down -v`: `-v` deletes the database volume.
