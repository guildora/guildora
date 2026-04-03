# Skill: Auth And Permissions

## Purpose

Apply the repository's real access model correctly across sessions, page middleware, and server handlers.

## When To Use

- editing login flows
- adding or changing access checks
- working on moderator or admin functionality
- touching session- or role-dependent UI

## Relevant Project Areas

- `apps/hub/server/utils/auth.ts`
- `apps/hub/app/middleware/*` (incl. `mandatory-fields.global.ts` for required custom fields, `settings.ts` for moderation-rights gating)
- `apps/hub/server/api/*`
- `apps/web/server/api/auth/discord.get.ts`

## Rules And Constraints

- canonical session field is `permissionRoles`
- `roles` is a legacy alias only
- `requireSession` allows any logged-in role, including `temporaer`
- landing does not own real auth; it can only forward to hub

## Step-By-Step Orientation

1. Read `docs/permissions-matrix.md`.
2. Read `docs/api-contracts.md`.
3. Inspect the relevant route handler and any shared auth utility.

## Docs References

- `docs/permissions-matrix.md`
- `docs/api-contracts.md`

## Common Mistakes To Avoid

- assuming `session` means only `user` and above
- gating a page correctly but leaving the API under-protected
