# Skill: Docs Maintenance

## Purpose

Keep `docs/` and `ai/` synchronized with the actual repository state.

## When To Use

- after changing routes, permissions, schema, subsystem responsibilities, or workflows
- when cleaning up stale documentation
- when adding a new AI skill or manifest entry

## Relevant Project Areas

- `docs/*`
- `ai/*`

## Rules And Constraints

- derive documentation from the real code, not from old docs
- preserve useful historical context by marking legacy behavior explicitly instead of deleting it silently
- avoid duplicate explanations across many files when one canonical doc can be linked instead
- keep JSON manifests concise and factual

## Step-By-Step Orientation

1. Identify the real source files that changed.
2. Update the nearest canonical doc in `docs/`.
3. Update the corresponding skill in `ai/skills/`.
4. Update affected JSON manifests.
5. Check for contradictions in the root `README.md`.

## Docs References

- `docs/README.md`
- `docs/api-contracts.md`
- `docs/permissions-matrix.md`
- `docs/domain-model.md`
- `docs/architecture.md`
- `docs/routing-and-navigation.md`

## Common Mistakes To Avoid

- leaving old German-only descriptions that contradict current English docs
- updating narrative docs but not the AI manifests
- inventing undocumented features to fill perceived gaps
