# Routing and Navigation

## App Ownership

- `apps/web` owns public landing routes.
- `apps/hub` owns login, authenticated routes, role-gated routes, and `/api/*`.

## Public Routes (Web)

- `/` renders the CMS-managed landing page.

## Internal Routes (Hub)

### Public Hub Routes

- `/` redirects to `/dashboard`
- `/login` starts Discord login in production and redirects directly in development

### Authenticated Hub Routes

- `/dashboard`
- `/members`
- `/members/[id]`
- `/profile`
- `/profile/name`
- `/profile/roles`
- `/profile/design`
- `/profile/[id]` redirects to `/members/[id]`
- `/marketplace`
- `/marketplace/submit` redirects to `/marketplace`
- `/marketplace/[appId]` redirects to `/marketplace`
- `/cms`

### Moderator Hub Routes

- `/mod`

### Admin Hub Routes

- `/admin`
- `/admin/design`
- `/admin/theme` redirects to `/admin/design`
- `/admin/permissions`
- `/admin/discord-roles`
- `/admin/apps`
- `/admin/apps/review` redirects to `/admin/apps`
- `/admin/dev-role-switcher`
- `/admin/users` redirects to `/admin/dev-role-switcher`

## Hub Layouts

- `default`: login and simple public hub pages
- `internal`: authenticated shell with sidebar navigation, branding, and mobile drawer

## Hub Middleware

- `auth`: requires an active session
- `moderator`: requires `moderator`, `admin`, or `superadmin`
- `admin`: requires `admin` or `superadmin`
- `locale.global`: applies locale routing for hub pages

## Internal Navigation Model (Hub)

Sidebar navigation merges:

1. core navigation in `apps/hub/server/utils/core-navigation.ts`
2. active installed app manifests in `apps/hub/server/utils/apps.ts`

Merged result is served by `GET /api/apps/navigation`.

## Locale Handling

- Project uses `prefix_except_default`
- English routes are unprefixed
- German routes use `/de/...`
- Landing locale handling is managed in `apps/web`
- Hub locale handling is managed in `apps/hub/app/middleware/locale.global.ts`

## Notes

- `/cms` is an embedded CMS session bootstrap, not a local editor.
- Landing rendering moved out of hub and is no longer served by hub routes.
