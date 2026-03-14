# Skill: Admin And Moderation

## Purpose

Work safely inside the moderator and admin feature set, especially where actions affect community roles, Discord state, or user deletion.

## When To Use

- editing `/mod` flows
- editing `/admin` flows
- changing community role, application, Discord mirror, or app-management behavior

## Relevant Project Areas

- `apps/hub/app/pages/mod/index.vue`
- `apps/hub/app/pages/admin/*`
- `apps/hub/server/api/mod/*`
- `apps/hub/server/api/admin/*`
- `apps/hub/server/utils/admin-mirror.ts`

## Rules And Constraints

- application workflows are distinct from marketplace submissions
- community role changes can trigger permission-role sync and bot sync
- user-delete flows can reconcile instead of deleting if a mapped Discord role remains
- only superadmins may perform certain operations such as self-import and deleting superadmin accounts

## Step-By-Step Orientation

1. Read the relevant workflow doc:
   - applications
   - Discord role management
   - admin user mirroring
   - app lifecycle
2. Read `docs/permissions-matrix.md`.
3. Inspect the current admin or mod page together with its API handlers.
4. Preserve current safeguards unless the change explicitly updates them.

## Docs References

- `docs/workflows/applications.md`
- `docs/workflows/discord-role-management.md`
- `docs/workflows/admin-user-mirroring.md`
- `docs/workflows/app-lifecycle.md`
- `docs/permissions-matrix.md`

## Common Mistakes To Avoid

- mixing moderator-only and admin-only behavior
- deleting users without understanding the reconcile path
- treating placeholder Marketplace pages as the current app-management flow
