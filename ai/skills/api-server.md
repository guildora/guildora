# Skill: API Server

## Purpose

Work correctly within the Nitro API layer and its current auth, validation, and utility patterns.

## When To Use

- adding or updating routes under `apps/hub/server/api`
- changing request or response contracts
- introducing new server-side workflow logic
- documenting the landing OAuth redirect shim in `apps/web/server/api`

## Relevant Project Areas

- `apps/hub/server/api`
- `apps/hub/server/utils`
- `apps/web/server/api`
- `packages/shared`

## Rules And Constraints

- operational APIs belong in hub, not landing
- the web-side `/api/auth/discord` route is a redirect shim only
- method belongs in the filename suffix
- validate request bodies with Zod or the shared parsing helpers
- use `requireSession`, `requireAdminSession`, `requireModeratorSession`, or `requireRole`
- do not rely on page middleware for actual authorization
- update route docs and AI manifests when contracts change

## Step-By-Step Orientation

1. Read `docs/api-contracts.md`.
2. Read `docs/permissions-matrix.md`.
3. Read the workflow doc for the domain you are touching.
4. Inspect nearby handlers and the server utils they call.
5. Keep error behavior compatible with existing UI expectations and bot-bridge error codes where relevant.

## Docs References

- `docs/api-contracts.md`
- `docs/permissions-matrix.md`
- `docs/workflows/applications.md`
- `docs/workflows/discord-role-management.md`
- `docs/workflows/admin-user-mirroring.md`
- `docs/workflows/cms-sso.md`
- `docs/workflows/app-lifecycle.md`

## Common Mistakes To Avoid

- inventing new auth conventions when a shared helper already exists
- forgetting to update `ai/actions.registry.json` and `ai/resources/resources.manifest.json`
- breaking the role distinction between `permissionRoles` and legacy `roles`
