# Skill: Data Model

## Purpose

Use the shared schema and domain concepts correctly when changing persistence, joins, or role logic.

## When To Use

- editing `packages/shared/src/db/schema.ts`
- changing database reads or writes
- reasoning about role synchronization, applications, app manifests, or snapshots

## Relevant Project Areas

- `packages/shared/src/db/schema.ts`
- `packages/shared/src/types/*`
- `apps/hub/server/utils/*`
- `apps/bot/src/utils/*`

## Rules And Constraints

- `users.displayName` is a serialized composite value, not an arbitrary freeform field
- `profiles.customFields` is a mixed-use extension area; preserve existing keys unless intentionally migrated
- community roles and permission roles are different concepts and must not be collapsed
- singleton-like settings tables are still regular tables and should be handled consistently
- `communityCustomFields` is a separate table from `profiles.customFields` — do not confuse admin-managed field definitions with per-user extension data
- `applicationFlows` and `applications` are the current application system; the old `profiles.customFields.applicationStatus` is deprecated
- `applicationFlows.editorMode` (`editor_mode` enum: `simple` | `advanced`) tracks which editor was used; it is a frontend concern stored in DB for persistence — all flows produce the same `flow_json` regardless of mode
- `applicationAccessSettings` is a singleton that controls moderator access to the applications section
- `communityTags` are moderator-managed labels distinct from Discord roles
- `roleGroups` organize selectable Discord roles; each group can have one `rolePickerEmbed` for Discord reaction-based role selection
- landing page content is stored in `landingTemplates`, `landingPages`, `landingSections`, and `landingPageVersions` — not in the CMS
- `membershipSettings.cleanupRoleConfigs` is a per-permission-role JSONB config array, replacing the former global cleanup conditions

## Step-By-Step Orientation

1. Read `docs/domain-model.md`.
2. Read `docs/subsystems/shared-package.md`.
3. Read the workflow docs tied to the affected tables.
4. Inspect how the current server utilities read and write the tables.
5. If schema changes are required, update docs and AI manifests in the same change.

## Docs References

- `docs/domain-model.md`
- `docs/subsystems/shared-package.md`
- `docs/workflows/applications.md`
- `docs/workflows/discord-role-management.md`
- `docs/workflows/admin-user-mirroring.md`
- `docs/workflows/app-lifecycle.md`

## Common Mistakes To Avoid

- documenting fields that do not exist, such as `profiles.bio`
- treating `user_discord_roles` as the live source of truth for Discord
- forgetting the `payload` schema is separate from the main app domain
