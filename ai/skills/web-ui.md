# Skill: Web UI

## Purpose

Extend or modify the Nuxt frontend in a way that matches the existing internal UX, routing, i18n, and navigation patterns.

## When To Use

- adding or editing pages under `apps/hub/app/pages`
- creating internal UI components
- touching layout, sidebar, or profile, admin, and moderation pages
- updating the public landing renderer in `apps/web`

## Relevant Project Areas

- `apps/hub/app/pages`
- `apps/hub/app/components`
- `apps/hub/app/components/ui`
- `apps/hub/app/layouts`
- `apps/hub/app/middleware`
- `apps/hub/app/composables`
- `apps/web/app/pages`
- `apps/web/app/components`
- `apps/web/app/composables`

## Rules And Constraints

- internal authenticated UI must follow the RetroMorphism design rules
- prefer `apps/hub/app/components/ui/*` over raw controls for new internal forms
- all new user-facing text must use i18n keys in both `en` and `de`
- page middleware is a UX aid only; real authorization still belongs on the server
- keep landing public and separate from hub-only flows

## Step-By-Step Orientation

1. Read `docs/routing-and-navigation.md`.
2. Read `docs/design-system-retromorphism.md`.
3. Read `docs/i18n-architecture.md`.
4. Inspect the relevant existing page and its sibling pages.
5. Reuse existing composables and layout behavior where possible.

## Docs References

- `docs/routing-and-navigation.md`
- `docs/design-system-retromorphism.md`
- `docs/i18n-architecture.md`
- `docs/subsystems/web-app.md`
- `docs/subsystems/web-landing.md`

## Common Mistakes To Avoid

- adding hard-coded UI strings
- creating new internal button styles outside the shared visual system
- pulling internal workflows into the public landing app
