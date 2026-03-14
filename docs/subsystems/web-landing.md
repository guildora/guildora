# Subsystem: Web Landing

## Purpose

`apps/web` is the public landing application.

It serves:

- CMS-backed landing page rendering
- public login CTA linking to hub login
- localized public copy (`en`/`de`)

## Important Directories

- `app/pages`
- `app/layouts`
- `app/components/landing`
- `app/components/layout`
- `app/composables`
- `i18n/locales`

## Runtime Patterns

- landing content fetched from CMS HTTP API via `usePayload`
- landing blocks rendered by `CmsBlockRenderer`
- no internal auth/session API ownership

## Boundaries

- does not host internal member/mod/admin flows
- does not own `/api/*`
- depends on CMS content publication state
