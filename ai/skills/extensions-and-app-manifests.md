# Skill: Extensions And App Manifests

## Purpose

Work with the repository's current extension seam: stored app manifests, app navigation, and bot hook declarations.

## When To Use

- changing app-manifest parsing
- editing installed app behavior
- touching app sideloading or app navigation
- documenting extension capabilities and limitations

## Relevant Project Areas

- `packages/shared/src/types/app-manifest.ts`
- `apps/hub/server/utils/apps.ts`
- `apps/hub/server/api/admin/apps/*`
- `apps/bot/src/utils/app-hooks.ts`

## Rules And Constraints

- manifests are validated through the shared Zod schema
- active apps affect navigation and bot hook registration
- manifest-declared pages and API routes are metadata today, not automatic runtime loading
- Marketplace submission storage exists, but local marketplace review is not a complete product flow

## Step-By-Step Orientation

1. Read `docs/workflows/app-lifecycle.md`.
2. Read `docs/workflows/marketplace-submissions.md`.
3. Read `docs/subsystems/shared-package.md`.
4. Inspect the manifest parser and installed-app utility code.

## Docs References

- `docs/workflows/app-lifecycle.md`
- `docs/workflows/marketplace-submissions.md`
- `docs/subsystems/shared-package.md`

## Common Mistakes To Avoid

- treating manifest metadata as a fully dynamic plugin runtime
- assuming all marketplace concepts are active product features
- forgetting to refresh the app registry after install-state changes
