# Skill: Platform Setup & Multi-Platform

## Purpose

Manage platform connections (Discord, Matrix), user identity across platforms, and the setup wizard for new Guildora instances.

## When To Use

- adding or modifying platform connection logic
- working on the setup wizard
- modifying authentication to support new platforms
- updating user identity linking (platform accounts)
- changing how the Hub communicates with bot services

## Relevant Project Areas

- `apps/hub/server/utils/platformConfig.ts` — DB-backed config with cache + ENV fallback
- `apps/hub/server/utils/platformBridge.ts` — routes requests to correct platform bot
- `apps/hub/server/utils/platformUser.ts` — getUserByPlatformId, ensurePlatformUser, linkPlatformAccount
- `apps/hub/server/api/admin/platforms/*` — Platform CRUD admin API
- `apps/hub/server/api/auth/matrix.get.ts` — Matrix SSO login
- `apps/hub/server/api/auth/platforms.get.ts` — available auth platforms
- `apps/hub/server/api/setup/*` — setup wizard API
- `apps/hub/app/pages/settings/platforms.vue` — admin UI
- `apps/hub/app/pages/login.vue` — dynamic login buttons
- `packages/shared/src/db/schema.ts` — `platformConnections`, `userPlatformAccounts` tables

## Rules And Constraints

- `platform_connections` table has a unique constraint on `platform` — only one Discord and one Matrix connection per instance
- credentials are stored as JSONB, never exposed in GET list responses
- ENV variables are a fallback only — DB config takes priority
- when no platforms are configured at all, Discord login is shown by default (backward compat)
- `users.discord_id` is **nullable** — Matrix-only users have `null`
- `user_platform_accounts` links users to external identities via `(platform, platform_user_id)` unique constraint
- the setup wizard (`/api/setup/platform`) only works when `platform_connections` is empty (returns 403 after first setup)
- platform health checks go to `/internal/health` on the bot's internal URL

## Key Types

```typescript
type PlatformType = "discord" | "matrix";
type DiscordPlatformCredentials = { botToken, clientId, clientSecret, guildId };
type MatrixPlatformCredentials = { homeserverUrl, accessToken, spaceId };
```

## Docs References

- `docs/architecture.md` — platform abstraction overview
- `docs/domain-model.md` — `platform_connections` and `user_platform_accounts` tables
- `docs/subsystems/matrix-bot.md` — Matrix bot service
- `docs/for-hosters/configuration.md` — ENV variables and platform setup instructions

## Common Mistakes To Avoid

- exposing credentials in API responses (GET endpoints must not return `credentials` or `botInternalToken`)
- forgetting to call `invalidatePlatformCache()` after DB changes
- assuming `users.discordId` is always non-null
- not handling the case where a platform connection is disabled but still in the DB
- hardcoding `"discord"` in new code that should be platform-agnostic
