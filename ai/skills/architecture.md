# Skill: Architecture

## Purpose

Understand how the repository is split across public landing, internal hub, bot, and shared package before making cross-cutting changes.

## When To Use

- planning or implementing changes touching more than one app
- reasoning about data flow or service boundaries
- deciding where a new feature belongs

## Relevant Project Areas

- `apps/web`
- `apps/hub`
- `apps/bot`
- `packages/shared`
- `packages/mcp-server`

## Rules And Constraints

- treat the hub app as the operational center for members, moderation, admin logic, and the real auth flow
- treat the web app as public landing plus a compatibility OAuth redirect shim
- treat the bot as the source of truth for live Discord guild state
- treat the Hub as the source of truth for landing-page content (DB-backed, managed at `/settings/landing`, served via `/api/public/landing`)

## Step-By-Step Orientation

1. Read `docs/project-overview.md`.
2. Read `docs/architecture.md`.
3. Read the relevant subsystem docs in `docs/subsystems/`.
4. Only then inspect the concrete code path you want to change.
5. If a change crosses service boundaries, document the affected flow in `docs/workflows/`.

## Docs References

- `docs/project-overview.md`
- `docs/architecture.md`
- `docs/subsystems/web-app.md`
- `docs/subsystems/web-landing.md`
- `docs/subsystems/bot.md`
- `docs/subsystems/shared-package.md`

## Common Mistakes To Avoid

- treating landing as if it owned internal workflows
- assuming Marketplace pages are fully local product features
- changing shared domain behavior in one app without checking `packages/shared`
