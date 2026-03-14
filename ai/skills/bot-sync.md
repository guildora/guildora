# Skill: Bot Sync

## Purpose

Handle Discord synchronization, voice tracking, and bot-bridge interactions without breaking the relationship between the hub app and the bot.

## When To Use

- changing bot endpoints
- editing voice-session logic
- modifying user sync, role sync, or guild mirror flows
- touching app hook registration

## Relevant Project Areas

- `apps/bot/src/events/*`
- `apps/bot/src/utils/internal-sync-server.ts`
- `apps/bot/src/utils/app-hooks.ts`
- `apps/hub/server/utils/botSync.ts`
- `apps/hub/server/utils/admin-mirror.ts`

## Rules And Constraints

- the bot bridge is token-protected and internal
- current role sync logic is split between:
  - permission-role and nickname sync
  - self-service allowed Discord role sync
  - admin remove-role operations
- local snapshots must not be confused with live guild state

## Step-By-Step Orientation

1. Read `docs/subsystems/bot.md`.
2. Read `docs/workflows/discord-role-management.md`.
3. Read `docs/workflows/admin-user-mirroring.md`.
4. Inspect both the bot-side endpoint and the hub-side caller before changing behavior.

## Docs References

- `docs/subsystems/bot.md`
- `docs/workflows/discord-role-management.md`
- `docs/workflows/admin-user-mirroring.md`
- `docs/architecture.md`

## Common Mistakes To Avoid

- changing a bot payload shape without updating the hub-side consumer
- assuming all Discord roles are user-editable
- forgetting privileged-intent requirements for member and voice features
