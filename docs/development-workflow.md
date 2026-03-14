# Development Workflow

## Workspace Basics

- Package manager: `pnpm`
- Task runner: `turbo`
- Node target: `>=20`
- Main workspace scripts: root `package.json`

## Common Commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm bot:deploy-commands`

App-specific scripts:

- `pnpm --filter @newguildplus/web dev`
- `pnpm --filter @newguildplus/hub dev`
- `pnpm --filter @newguildplus/cms dev`
- `pnpm --filter @newguildplus/bot dev`

## Core Engineering Conventions

### Hub API

- Nitro handlers are file-based under `apps/hub/server/api`
- HTTP method is encoded in filename suffix: `.get`, `.post`, `.put`, `.delete`
- auth via `requireSession`, `requireModeratorSession`, `requireAdminSession`, or `requireRole`
- request parsing via Zod helpers (`readBodyWithSchema` when appropriate)

### Roles

- sessions should use canonical `permissionRoles`
- `roles` exists as legacy alias only
- community roles map to one permission role and stay synchronized

### Profile Names

- `users.displayName` is serialized composite field
- canonical delimiter: ` | `
- use `serializeProfileName`, `parseProfileName`, `coerceProfileNameFromRaw`

### UI

- internal UI work should prefer `apps/hub/app/components/ui/*`
- internal buttons must remain RetroMorphism-aligned
- styling-only changes must not alter behavior unless intentional

### Internationalization

- all new user-facing text uses i18n keys
- keep `de` and `en` synced in owning app
- do not switch locale before `/api/profile/locale` succeeds

### Documentation

When routes, tables, roles, or workflows change, update `docs` + `ai` in same change.

## Current Test Coverage

Automated tests are currently concentrated in hub:

- auth helper behavior
- core navigation assembly
- dev role switcher helper logic
- Discord role snapshot helpers
- locale resolution and locale key parity
- theme color utilities

There is currently no comparable automated suite for CMS, bot runtime, or end-to-end multi-service flows.

## Recommended Change Flow

1. Update schema/shared types if domain changes.
2. Update hub Nitro handlers and server utils.
3. Update UI (hub and/or web landing).
4. Re-check permissions and localization implications.
5. Update docs and AI manifests in same change set.
