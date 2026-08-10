# Deploy PlayHub with HTTPS on an Azure Linux VM

PlayHub is served only through Caddy at `https://playhubb.site`. Caddy obtains and renews the Let's Encrypt certificate automatically after DNS points the domain at the VM.

## Quick Path

1. In GoDaddy DNS, create or update the `A` record for `@` to `158.23.163.230`. Do not create a `www` record for this deployment.
2. In the Azure network security group and the VM host firewall, allow inbound TCP ports `22` (SSH, limited to administrator IPs where possible), `80` (HTTP), and `443` (HTTPS).
3. Wait for the public DNS record for `playhubb.site` to resolve to `158.23.163.230` before starting Caddy. Let's Encrypt validation requires public access on ports `80` and `443`.
4. Install Docker Engine and the Docker Compose plugin, then clone the repository and configure the root `.env` without committing it.

```bash
git clone <repository-url> playhub
cd playhub
cp .env.example .env
nano .env
docker compose up -d --build
```

Open `https://playhubb.site/` after the stack is running. The direct VM IP no longer serves the application after this cutover.

## Prerequisites

| Area | Required configuration |
|---|---|
| Azure VM | Linux VM with public IP `158.23.163.230` and SSH access |
| DNS | GoDaddy `A` record `@` points to `158.23.163.230` before Caddy starts |
| Azure network security group | Inbound TCP `22`, `80`, and `443`; limit `22` to administrator IPs where possible |
| VM host firewall | Inbound TCP `22`, `80`, and `443`; limit `22` to administrator IPs where possible |
| Docker | Docker Engine and Docker Compose plugin installed on the VM |
| Configuration | A local root `.env` created from `.env.example`; never commit it |

Only Caddy publishes host ports `80` and `443`. The application listens internally on port `8080`; PostgreSQL is not exposed on the VM.

## Proxy Trust Boundary

Compose enables `TrustForwardedHeaders` only for this Caddy deployment. It trusts `X-Forwarded-For` and `X-Forwarded-Proto` only from the private `172.30.0.0/24` Docker proxy network, which lets the application recognize Caddy's HTTPS termination without accepting those headers from direct clients.

Do not publish application host ports or enable `TrustForwardedHeaders` for direct or local deployments. If the application is reachable outside the Docker proxy network, a client could spoof forwarded headers and bypass the intended trust boundary.

## Check Status

```bash
docker compose ps
docker compose logs --tail=100 app
docker compose logs --tail=100 caddy
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

Run this exact command from the repository directory on the VM:

```bash
git pull --ff-only && docker compose up -d --build && docker image prune -f
```

## Verify HTTPS

```bash
curl -I https://playhubb.site/
```

Confirm the response is successful and the browser shows a valid certificate for `playhubb.site`. If issuance fails, first confirm that public DNS has propagated and Azure allows ports `80` and `443`.

## Back Up PostgreSQL

Run this from the repository directory on the VM. Store the resulting backup off the VM as well.

```bash
mkdir -p backups
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "backups/playhub-$(date +%F).sql"
```

The command reads the configured database name and user from the database container, so it does not expose them in the shell command.

## Back Up Caddy Certificates

The named `caddy_data` volume stores Let's Encrypt account and certificate data; `caddy_config` stores Caddy runtime configuration. Back up both Compose-created named volumes and store the backups off the VM along with the PostgreSQL backup. Preserve both volumes when recreating containers so Caddy can reuse its certificates and avoid unnecessary certificate issuance.
