# Skill: CMS

## Purpose

Work correctly with the Payload CMS content model, access rules, and its integration with web landing and hub.

## When To Use

- editing `apps/cms`
- modifying CMS SSO behavior
- working with editorial content (pages, media, site settings)

## Relevant Project Areas

- `apps/cms/payload.config.ts`
- `apps/cms/src/collections/*`
- `apps/cms/src/globals/*`
- `apps/cms/src/blocks/*`
- `apps/cms/src/endpoints/cms-sso.ts`
- `apps/hub/app/pages/cms/index.vue`

## Rules And Constraints

- CMS tables live in the `payload` schema
- landing page content is **not** managed by CMS — it is managed in Hub via DB tables (`landing_sections`, `landing_pages`, etc.) and served by `/api/public/landing`
- CMS roles are local to Payload
- CMS is used for editorial content only (pages, media, site settings)
- hub embeds CMS via signed SSO; it does not become the CMS runtime owner

## Step-By-Step Orientation

1. Read `docs/subsystems/cms.md`.
2. Read `docs/workflows/cms-sso.md` if auth is involved.
3. Inspect the relevant collection, block, or global definition.
4. Note: landing page rendering is handled by Hub, not CMS — see `apps/web/app/composables/useLanding.ts` and `app/components/landing/blocks/`.

## Docs References

- `docs/subsystems/cms.md`
- `docs/workflows/cms-sso.md`
- `docs/i18n-architecture.md`

## Common Mistakes To Avoid

- adding CMS concepts to the wrong schema
- changing a block model without checking the landing renderer
- assuming CMS access is governed by app-domain roles directly
