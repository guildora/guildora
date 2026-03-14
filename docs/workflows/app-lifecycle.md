# Workflow: App Lifecycle

This workflow describes how installed apps currently behave in the repository.

## App Manifest Source of Truth

Manifests are validated through `packages/shared/src/types/app-manifest.ts`.

Supported manifest sections include:

- metadata
- permissions
- navigation
- pages
- API routes
- bot hooks
- config fields
- required environment variables
- install notes
- migrations
- compatibility

## Sideload Install

Route:

- `POST /api/admin/apps/sideload`

Flow:

1. Admin submits a GitHub manifest URL.
2. The server normalizes the URL.
3. The server fetches the manifest JSON.
4. The manifest is validated with `safeParseAppManifest`.
5. The row is inserted or updated in `installed_apps`.
6. Status is set based on the `activate` flag.
7. The in-memory app registry is refreshed.

## Activation and Deactivation

Routes:

- `POST /api/apps/:appId/activate`
- `POST /api/apps/:appId/deactivate`
- `PUT /api/admin/apps/:appId/status`

Only active apps are included when:

- loading app registry state
- generating app-provided navigation
- registering bot hooks

## Navigation Contribution

Active app manifests can contribute:

- rail entries
- grouped panel entries
- role-gated navigation items

The hub app merges them with core navigation in `/api/apps/navigation`.

## Bot Hook Contribution

Active app manifests can declare bot hooks. The bot loads them at startup through `loadInstalledAppHooks()`.

Current behavior:

- hooks register as lightweight logging handlers per app
- invalid manifests are skipped
- hook execution is sandboxed by an error boundary so one app cannot crash the bot runtime

## Current Limits

- manifest-declared pages and API routes are metadata, not an automatic runtime loader
- installed apps are stored and surfaced in navigation, but they do not yet represent a full plugin execution environment
