# RetroMorphism Design System

Source design reference: Figma file `RetroMorphism--Community-`.

## Scope

This design system is mandatory for the internal authenticated web application:

- member area
- moderator area
- admin area

It does not govern the public landing page or CMS-authored public content layouts.

## Theme Modes

- `retromorphism-light`
- `retromorphism-dark`

User preference is stored as `appearancePreference` with values:

- `light`
- `dark`
- `system`

The active HTML theme is derived from resolved color mode, not from arbitrary page-level overrides.

## Theme Data Model

Theme values come from `theme_settings` and are normalized by:

- `apps/hub/server/utils/theme.ts`
- `apps/hub/utils/theme-colors.ts`

Theme configuration currently includes:

- dominant, secondary, accent colors
- semantic info, success, warning, and error colors
- content-tone flags for accent and semantic colors
- optional sidebar logo and its display size

## Typography

- primary UI font: `Nunito`
- avoid introducing disconnected type systems for internal pages

## Preferred UI Components

Base internal UI wrappers live in `apps/hub/app/components/ui/`.

Current templates:

- `RetroButton.vue`
- `RetroInput.vue`
- `RetroSelect.vue`
- `RetroTextarea.vue`
- `RetroCheckbox.vue`
- `RetroFileInput.vue`
- `RetroColorInput.vue`
- `RetroTag.vue`
- `RetroDropdown.vue`
- `RetroOptionRow.vue`
- `RetroModalTitle.vue`

## Rules

- prefer the UI wrappers above over raw form controls in new internal UI work
- internal buttons must remain RetroMorphism-consistent
- avoid page-specific hard-coded theme colors when a CSS variable or theme utility already exists
- styling-only changes must not alter functional behavior

## Current Reality Check

The codebase still contains some direct DaisyUI button usage in internal pages. New work should move toward the shared wrappers and avoid creating new divergent patterns.
