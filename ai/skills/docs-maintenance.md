# Skill: Docs Maintenance

## Purpose

Keep `docs/`, `ai/`, and agent-facing repository instructions synchronized with the actual repository state.

## When To Use

- after changing routes, permissions, schema, subsystem responsibilities, or workflows
- when cleaning up stale documentation
- when adding a new AI skill or manifest entry
- when app ownership between landing and hub changes

## Relevant Project Areas

- `docs/*`
- `ai/*`
- `AGENTS.md`
- `README.md`

## Rules And Constraints

- derive documentation from the real code, not from old docs
- preserve useful historical context by marking legacy behavior explicitly instead of deleting it silently
- avoid duplicate explanations across many files when one canonical doc can be linked instead
- keep JSON manifests concise and factual
- if landing and hub differ, document the ownership boundary explicitly

## Step-By-Step Orientation

1. Identify the real source files that changed.
2. Update the nearest canonical doc in `docs/`.
3. Update the corresponding skill in `ai/`.
4. Update affected JSON manifests.
5. Check `AGENTS.md` and `README.md` for contradictions.

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
- documenting all `/api/*` as hub-owned when landing still carries a compatibility shim
