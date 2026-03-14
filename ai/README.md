# NewGuildPlus AI Context

This directory is the AI-oriented working layer for the repository.

## Purpose

- point AI agents to the canonical project documentation in `docs/`
- encode project-specific working rules and extension patterns
- keep lightweight machine-readable manifests for routes, entities, actions, and readable resources
- reflect the split ownership model: `web` (landing) and `hub` (internal + API)

## Structure

- `skills/`: task-oriented Markdown skills for AI agents
- `actions.registry.json`: action inventory for Nitro mutations and important reads
- `routes.manifest.json`: page and route overview
- `entities.schema.json`: summary of the application-domain schema
- `resources/resources.manifest.json`: read-oriented API resource inventory

## Recommended Reading Order For AIs

1. `../docs/README.md`
2. `skills/architecture.md`
3. `skills/data-model.md`
4. `skills/auth-permissions.md`
5. other task-specific skills as needed

## Maintenance Rule

When routes, permissions, schema fields, or core workflows change, update:

- the relevant file in `docs/`
- the corresponding skill in `skills/`
- any affected JSON manifest in this directory
