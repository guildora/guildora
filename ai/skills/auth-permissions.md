# Skill: Auth And Permissions

## Purpose

Apply the repository's real access model correctly across sessions, page middleware, server handlers, and CMS SSO.

## When To Use

- editing login flows
- adding or changing access checks
- working on moderator/admin functionality
- touching session or role-dependent UI

## Relevant Project Areas

- `apps/hub/server/utils/auth.ts`
- `apps/hub/app/middleware/*`
- `apps/hub/server/api/*`
- `apps/hub/server/utils/cms-access.ts`

## Rules And Constraints

- canonical session field is `permissionRoles`
- `roles` is a legacy alias only
- `requireSession` allows any logged-in role, including `temporaer`
- `/cms` page access is finalized by the API, not just page middleware
- CMS roles are separate from app-domain permission roles

## Step-By-Step Orientation

1. Read `docs/permissions-matrix.md`.
2. Read `docs/api-contracts.md`.
3. Read `docs/workflows/cms-sso.md` if CMS access is involved.
4. Inspect the relevant route handler and any shared auth utility.

## Docs References

- `docs/permissions-matrix.md`
- `docs/api-contracts.md`
- `docs/workflows/cms-sso.md`

## Common Mistakes To Avoid

- assuming `session` means only `user` and above
- gating a page correctly but leaving the API under-protected
- conflating app permission roles with Payload CMS roles
