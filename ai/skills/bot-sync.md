# Skill: Bot Sync (Multi-Platform)

## Purpose

Handle platform synchronization, voice tracking, and bot-bridge interactions without breaking the relationship between the hub app and the platform bot connectors (Discord and Matrix).

## When To Use

- changing bot endpoints
- editing voice-session logic
- modifying user sync, role sync, or guild mirror flows
- touching app hook registration

## Relevant Project Areas

- `apps/bot/src/events/*` (Discord bot events)
- `apps/bot/src/utils/internal-sync-server.ts` (Discord bot HTTP API)
- `apps/bot/src/utils/app-hooks.ts` (Discord app hook dispatch)
- `apps/matrix-bot/src/utils/internal-sync-server.ts` (Matrix bot HTTP API — same contract)
- `apps/matrix-bot/src/events/*` (Matrix bot events)
- `apps/hub/server/utils/botSync.ts` (Discord-specific wrapper — legacy, calls platformBridge)
- `apps/hub/server/utils/platformBridge.ts` (platform-agnostic routing layer — preferred for new code)
- `apps/hub/server/utils/platformConfig.ts` (platform connection config with DB + ENV fallback)
- `apps/hub/server/utils/admin-mirror.ts`

## Rules And Constraints

- the bot bridge is token-protected and internal
- **new code should use `platformBridge.ts`** instead of calling `botSync.ts` directly
- both Discord and Matrix bots expose the same internal HTTP API contract
- current Discord role sync logic is split between:
  - permission-role and nickname sync
  - self-service allowed Discord role sync
  - admin remove-role operations
- Matrix uses power levels (0-100) instead of discrete roles
- local snapshots must not be confused with live guild/space state
- app hook payloads should include `platform` field for multi-platform awareness

## Step-By-Step Orientation

1. Read `docs/subsystems/bot.md`.
2. Read `docs/workflows/discord-role-management.md`.
3. Read `docs/workflows/admin-user-mirroring.md`.
4. Inspect both the bot-side endpoint and the hub-side caller before changing behavior.

## Docs References

- `docs/subsystems/bot.md` (Discord bot)
- `docs/subsystems/matrix-bot.md` (Matrix bot)
- `docs/workflows/discord-role-management.md`
- `docs/workflows/admin-user-mirroring.md`
- `docs/architecture.md`

## Common Mistakes To Avoid

- changing a bot payload shape without updating the hub-side consumer **and** both bot implementations
- assuming all Discord roles are user-editable
- forgetting privileged-intent requirements for member and voice features (Discord-specific)
- using `botSync.ts` directly for new features instead of `platformBridge.ts`
- forgetting to include `platform` field in new hook payloads
- assuming a user always has a `discordId` (Matrix-only users have `null`)
