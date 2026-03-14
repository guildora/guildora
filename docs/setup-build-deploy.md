# Setup, Build, and Deployment

## Prerequisites

- Node.js 20 or newer
- pnpm 10
- PostgreSQL
- a Discord application for OAuth and the bot
- Docker and Docker Compose for containerized deployment

## Environment Variables

Start from repository root `.env.example`.

Key groups:

- hosts/urls:
  - `APP_HOST` + `NUXT_PUBLIC_APP_URL` for landing (`web`)
  - `HUB_HOST` + `NUXT_PUBLIC_HUB_URL` for internal app (`hub`)
  - `CMS_HOST` + `NUXT_PUBLIC_CMS_URL` + `PAYLOAD_PUBLIC_SERVER_URL` for CMS
- database: `DATABASE_URL`, optional `DATABASE_SSL`
- hub auth: `NUXT_SESSION_PASSWORD`, Discord OAuth vars, `SUPERADMIN_DISCORD_ID`
- bot bridge: `BOT_INTERNAL_URL`, `BOT_INTERNAL_TOKEN`, `BOT_INTERNAL_PORT`
- CMS: `PAYLOAD_SECRET`, `CMS_SSO_SECRET`
- bot runtime: `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, optional `AFK_VOICE_CHANNEL_ID`

Important auth rule:

- `NUXT_OAUTH_DISCORD_REDIRECT_URI` must target hub, e.g. `https://hub.example.com/api/auth/discord`.

## Local Development

### Install and configure

```bash
pnpm install
cp .env.example .env
```

### Prepare database

```bash
pnpm db:migrate
pnpm db:seed
```

Generate a new migration when shared schema changes:

```bash
pnpm db:generate
```

### Start applications

```bash
pnpm dev
```

Default local ports:

- web (landing): `3000`
- hub (internal): `3003`
- CMS dev server: `3002`
- bot internal sync server: configured by `BOT_INTERNAL_PORT`, default `3050`

### Deploy slash commands when needed

```bash
pnpm bot:deploy-commands
```

## Build

- root build: `pnpm build`
- web production start: `node apps/web/.output/server/index.mjs`
- hub production start: `node apps/hub/.output/server/index.mjs`
- CMS production start: `pnpm --filter @newguildplus/cms start`
- bot production start: `pnpm --filter @newguildplus/bot start`

## Docker Compose

Repository includes:

- `docker-compose.yml`
- `docker-compose.override.yml`

Services:

- `web`
- `hub`
- `cms`
- `bot`

Operational notes:

- web and hub both depend on CMS availability for content/SSO flows
- CMS stores uploads in `cms_media` volume
- bot runs on internal network and exposes sync server only to trusted callers
- compose assumes an external `caddy` network for reverse proxying

## Deployment Considerations

- Run migrations before or during deploy in a controlled step
- Seed only for initial setup or explicit role reconciliation
- Keep `BOT_INTERNAL_TOKEN`, `CMS_SSO_SECRET`, `PAYLOAD_SECRET`, and `NUXT_SESSION_PASSWORD` strong and private
- Ensure bot has privileged intents for members and voice states

## Known Operational Caveats

- Landing rendering depends on CMS public URL reachability from `web`
- CMS SSO depends on both `CMS_SSO_SECRET` and valid CMS base URL in `hub`
- Discord sync endpoints depend on bot internal server availability and authorization
