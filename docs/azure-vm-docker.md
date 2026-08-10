# Deploy PlayHub to an Azure Linux VM

This deployment serves PlayHub over HTTP at the VM public IP. Without a domain, TLS certificates and HTTPS are not configured. Do not use this deployment for credentials or data that require encrypted transit.

## Quick Path

1. Create a Linux Azure VM with a public IP and allow inbound TCP ports `22` (SSH) and `80` (HTTP) in its network security group.
2. Install Docker Engine and the Docker Compose plugin on the VM using Docker's Linux installation instructions for the VM distribution.
3. Clone this repository, create `.env` from `.env.example`, replace every placeholder with strong values, then start the stack.

```bash
git clone <repository-url> playhub
cd playhub
cp .env.example .env
nano .env
docker compose up -d --build
```

Open `http://<VM-PUBLIC-IP>/` after both services are running.

## Prerequisites

| Area | Required configuration |
|---|---|
| Azure VM | Linux VM with a public IP and SSH access |
| Network security group | Inbound TCP `22` limited to administrator IPs where possible; inbound TCP `80` for HTTP traffic |
| Docker | Docker Engine and Docker Compose plugin installed on the VM |
| Configuration | A local root `.env` created from `.env.example`; never commit it |

The Compose file publishes host port `80` to the application container's port `8080`. PostgreSQL is internal to the Docker network and is not exposed on the VM.

## Check Status

```bash
docker compose ps
docker compose logs --tail=100 app
docker compose logs --tail=100 db
```

The database health check must pass before the application starts. On its first initialization with an empty `postgres_data` volume, PostgreSQL runs `ReactApp1.Server/tablas.sql` from `/docker-entrypoint-initdb.d`. It does not rerun that script for an existing volume.

## Database Migration

Fresh deployments receive the durable move-idempotency schema from `tablas.sql`. Before updating an existing database volume, back it up, then apply the additive migration once:

```bash
docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < ReactApp1.Server/migrations/20260809_add_durable_move_idempotency.sql
```

The migration is safe to rerun after success. It assigns random idempotency UUIDs to existing moves, but stops without changing constraints if old moves have no player, invalid tic-tac-toe data, or duplicate match turns. Those records cannot be attributed or deduplicated safely and must be resolved explicitly before retrying.

Apply generic game support next, then load the `quiz_questions` seed block from `tablas.sql` once for an existing volume:

```bash
docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < ReactApp1.Server/migrations/20260809_add_generic_games.sql
```

This adds only `game_actions`, `quiz_questions`, and catalog metadata. Rollback is limited to dropping those new tables if no Memory or Trivia match history must be retained; never roll back the existing `moves` constraints as part of this feature.

## Update

```bash
git pull
docker compose up -d --build
docker image prune -f
```

## Back Up PostgreSQL

Run this from the repository directory on the VM. Store the resulting backup off the VM as well.

```bash
mkdir -p backups
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "backups/playhub-$(date +%F).sql"
```

The command reads the configured database name and user from the database container, so it does not expose them in the shell command.
