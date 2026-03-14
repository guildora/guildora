# Project Overview

## Purpose

NewGuildPlus is a community platform for Discord-based groups. The codebase centralizes identity, member profiles, moderation workflows, community roles, UI customization, landing-page content, and Discord synchronization.

Discord is both:

- the login provider for the internal hub application
- the source of guild member, role, and voice-state data

The internal hub is the operational center. Landing and CMS cover public content and publishing.

## Primary Audiences

- Visitors consuming the public landing page
- Members who log in via Discord and use the internal community area
- Moderators who review applications, edit member data, and manage role assignments
- Admins and superadmins who manage theme settings, community settings, Discord role mappings, installed apps, CMS access, and mirror flows
- CMS editors/moderators/admins managing public content
- AI agents and developers who need a grounded model of the repository

## Main Use Cases

- Public landing-page rendering from CMS content
- Discord OAuth login into the internal hub
- Member profile editing with structured display-name handling
- Community applications review and promotion from `Bewerber` to higher community roles
- Member directory search and voice-activity overview
- Self-service Discord role assignment from an admin-curated allowlist
- Admin synchronization between Discord guild membership and the internal database
- Optional extension through installed app manifests and app navigation entries

## Scope Boundaries

Included in this repository:

- Public landing UI (`apps/web`)
- Internal hub UI plus Nitro APIs (`apps/hub`)
- CMS authoring and publishing (`apps/cms`)
- Discord bot runtime (`apps/bot`)
- Shared PostgreSQL schema and cross-service types (`packages/shared`)

Explicitly not implemented as first-class local features:

- A local Marketplace product with full submission/review UI
- An in-repo MCP server
- Public API keys or OAuth flows for machine consumers

## Project Vocabulary

- `permission roles`: technical access roles stored in `permission_roles` and carried in sessions as `permissionRoles`
- `community roles`: domain roles such as `Bewerber`, `Anwaerter`, `Mitglied`, mapped to one permission role
- `applications`: community membership applications handled in moderation
- `submissions`: marketplace app submissions; table exists but local review flow is not active
- `installed apps`: app manifests stored in `installed_apps`, used for internal navigation and bot hook registration

## Repository Layout

```text
apps/
  web/       Nuxt 4 public landing app
  hub/       Nuxt 4 internal app + Nitro API + Discord OAuth
  cms/       Payload CMS 3 + Next.js content system
  bot/       Discord bot and internal sync server
packages/
  shared/    Drizzle schema, DB client, shared types and helpers
docs/        Canonical project documentation
ai/          AI-oriented skill and manifest layer
```
