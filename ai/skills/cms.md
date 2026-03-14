# Skill: CMS

## Purpose

Work correctly with the Payload CMS content model, access rules, and its integration with web landing and hub.

## When To Use

- editing `apps/cms`
- changing landing-page content structures
- modifying CMS SSO behavior
- updating how the landing app fetches landing data

## Relevant Project Areas

- `apps/cms/payload.config.ts`
- `apps/cms/src/collections/*`
- `apps/cms/src/globals/*`
- `apps/cms/src/blocks/*`
- `apps/cms/src/endpoints/cms-sso.ts`
- `apps/web/app/components/landing/*`
- `apps/web/app/composables/usePayload.ts`

## Rules And Constraints

- CMS tables live in the `payload` schema
- public landing content is fetched over HTTP from the CMS, not read directly from the DB by the landing app
- CMS roles are local to Payload
- landing layout changes should map cleanly to existing block rendering behavior in the landing app

## Step-By-Step Orientation

1. Read `docs/subsystems/cms.md`.
2. Read `docs/workflows/cms-sso.md` if auth is involved.
3. Inspect the relevant collection, block, or global definition.
4. If the change affects rendering, inspect `CmsBlockRenderer` and the landing page fetch path.

## Docs References

- `docs/subsystems/cms.md`
- `docs/workflows/cms-sso.md`
- `docs/i18n-architecture.md`

## Common Mistakes To Avoid

- adding CMS concepts to the wrong schema
- changing a block model without checking the landing renderer
- assuming CMS access is governed by app-domain roles directly
