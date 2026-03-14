# Skill: Architecture

## Purpose

Understand how the repository is split across web landing, hub, CMS, bot, and shared package before making cross-cutting changes.

## When To Use

- planning or implementing changes touching more than one app
- reasoning about data flow or service boundaries
- deciding where a new feature belongs

## Relevant Project Areas

- `apps/web`
- `apps/hub`
- `apps/cms`
- `apps/bot`
- `packages/shared`

## Rules And Constraints

- treat the hub app as the operational center for members, moderation, and admin logic
- treat the bot as the source of truth for live Discord guild state
- treat the CMS as the source of truth for public landing-page content
- do not assume the CMS and app-domain tables share the same schema namespace

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
- `docs/subsystems/cms.md`
- `docs/subsystems/bot.md`
- `docs/subsystems/shared-package.md`

## Common Mistakes To Avoid

- treating the CMS as part of the internal member app
- assuming Marketplace pages are fully local features
- changing shared domain behavior in one app without checking `packages/shared`
