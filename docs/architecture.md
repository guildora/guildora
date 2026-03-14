# Architecture

## Monorepo Topology

The repository is a pnpm workspace orchestrated with Turbo. It contains four deployable applications and one shared package:

- `apps/web` (public landing)
- `apps/hub` (internal app + auth + API)
- `apps/cms` (Payload authoring)
- `apps/bot` (Discord runtime)
- `packages/shared`

All services use TypeScript. Hub and bot import shared schema/types from `@newguildplus/shared`.

## Runtime Components

### Web (Landing)

- Framework: Nuxt 4
- Responsibility: render CMS-managed landing content for public visitors
- Integration: reads published content from CMS HTTP API

### Hub (Internal App)

- Framework: Nuxt 4 with Nitro
- API style: file-based handlers under `apps/hub/server/api`
- Authentication: `nuxt-auth-utils` session cookies + Discord OAuth
- Styling: Tailwind + DaisyUI + internal RetroMorphism wrappers
- Localization: `@nuxtjs/i18n`

### CMS

- Framework: Payload CMS 3 on Next.js
- DB schema: `payload`
- Content model: pages, media, CMS users, site settings, reusable blocks
- Access model: CMS-local roles (`editor`, `moderator`, `admin`)

### Discord Bot

- Library: `discord.js`
- Responsibilities:
  - voice session tracking
  - slash-command setup helper
  - internal HTTP bridge for guild role/member sync
  - manifest-based bot hook registration

### Shared Package

- Drizzle schema definitions
- Postgres client and migrations
- Zod app-manifest parsing
- profile-name helpers
- role/locale types

## Database Ownership

The repository uses one PostgreSQL instance with two logical areas:

- `public` schema for app domain (managed by Drizzle)
- `payload` schema for CMS-owned tables (managed by Payload)

## Key Data Flows

### Discord Login (Hub)

1. User opens hub login and hits `/api/auth/discord`.
2. Discord OAuth returns identity data.
3. Hub upserts `users` and ensures `profiles`.
4. Hub stores a session with canonical `permissionRoles`.

### Profile Updates (Hub)

1. Hub updates `users.display_name` from structured name parts.
2. `profiles.custom_fields` stores appearance/application metadata.
3. Locale preference is stored in `profiles.locale_preference`.
4. Hub optionally pushes nickname/role updates via bot bridge.

### Landing Content (Web + CMS)

1. Editors publish page content in CMS.
2. Landing app fetches published `landing` page from CMS HTTP API.
3. Landing app renders blocks via `CmsBlockRenderer`.

### Discord Mirror / Admin Import (Hub + Bot)

1. Admins map community roles to Discord roles.
2. Hub fetches guild members by mapped roles through bot bridge.
3. Mirror layer upserts local users/profiles/role assignments.
4. Orphan cleanup removes local users no longer represented by mapped Discord roles.

## External Integrations

- Discord OAuth for hub login
- Discord Gateway and REST APIs via `discord.js`
- GitHub raw/blob URLs for app sideload manifests
- Payload CMS HTTP API for landing reads

## Architecture Constraints

- Hub is the source of truth for internal profiles, moderation, admin workflows, and `/api/*`.
- Web is a public landing renderer, not an internal workflow host.
- Bot is the source of truth for live guild state and manageable Discord role operations.
- CMS content remains isolated from internal app-domain tables.
