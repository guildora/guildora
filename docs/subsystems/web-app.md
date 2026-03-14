# Subsystem: Hub App

## Purpose

`apps/hub` is the internal operational application. It serves:

- Discord login flow
- authenticated member pages
- moderator workflows
- admin workflows
- Nitro APIs under `/api/*`
- embedded CMS session bootstrap (`/cms`)

## Important Directories

- `app/pages`
- `app/layouts`
- `app/middleware`
- `app/components`
- `app/components/ui`
- `app/composables`
- `server/api`
- `server/utils`

## Runtime Patterns

- sessions via `nuxt-auth-utils`
- middleware handles UX route gating
- server routes are the authorization boundary
- internal navigation loads from `/api/apps/navigation`
- branding loads from `/api/internal/branding`

## Business Rules

- profile display names are stored centrally on `users`
- language changes persist before UI locale switch
- self-assignable Discord roles are limited to admin allowlist
- moderator access to `/cms` depends on `cms_access_settings`
- some admin/marketplace pages are intentional redirects

## Note

Public landing rendering is not part of hub and is served by `apps/web`.
