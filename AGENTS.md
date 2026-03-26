# Guildora – Context for AI and Agents

Guildora is a community platform with a public landing page, internal hub, Payload CMS, Discord bot, and a shared Postgres database with a Drizzle schema.

## Structure

- **apps/web** – Nuxt 4, public landing page, CMS rendering, login CTA, and OAuth redirect shim at `server/api/auth/discord.get.ts`.
- **apps/hub** – Nuxt 4, internal user, mod, and admin UI; Nitro API at `server/api/`; real Discord OAuth session logic; embedded CMS SSO.
- **apps/cms** – Payload CMS 3 + Next.js; editorial content, pages, media, site settings, and CMS users.
- **apps/bot** – Discord bot; voice tracking, guild sync, slash command setup, and internal sync server.
- **packages/shared** – Drizzle schema, types, Zod app manifest, DB client, migrations, seeds, and shared utilities.

## Roles (Permissions)

- **temporary**, **user**, **moderator**, **admin**, **superadmin**.
- Sessions canonically contain `permissionRoles`.
- `roles` is legacy compatibility only and not the primary source.
- Community roles (e.g. applicant, candidate, member) are domain-level; each maps to exactly one permission role.

## Key Conventions

- **API:** Method via file suffix (`.get`, `.post`, `.put`, `.delete`).
- **Auth:** Server-side via `requireSession`, `requireModeratorSession`, `requireAdminSession`, or `requireRole(...)`.
- **Landing vs. Hub:** `apps/web` stays public; internal workflows and operational APIs belong in `apps/hub`.
- **OAuth:** The real Discord OAuth callback logic lives in `apps/hub/server/api/auth/discord.get.ts`. The landing route at `apps/web/server/api/auth/discord.get.ts` only redirects.
- **Applications** = mod-area `applications` (member applications).
- **Submissions** = marketplace app submissions (`app_marketplace_submissions`); local full-review flow is not active yet.
- **Documentation:** Canonical docs live at https://github.com/guildora/docs — see references below.

## Documentation

All platform documentation: https://github.com/guildora/docs

Key references for this repo:

- Architecture: https://github.com/guildora/docs/blob/main/internals/guildora/architecture.md
- Domain model: https://github.com/guildora/docs/blob/main/internals/guildora/domain-model.md
- API contracts: https://github.com/guildora/docs/blob/main/internals/guildora/api-contracts.md
- Permissions matrix: https://github.com/guildora/docs/blob/main/internals/guildora/permissions-matrix.md
- Routing: https://github.com/guildora/docs/blob/main/internals/guildora/routing-and-navigation.md
- Development workflow: https://github.com/guildora/docs/blob/main/internals/guildora/development-workflow.md
- i18n architecture: https://github.com/guildora/docs/blob/main/internals/guildora/i18n-architecture.md
- Design system: https://github.com/guildora/docs/blob/main/DESIGN_SYSTEM.md
- Workflows: https://github.com/guildora/docs/blob/main/internals/guildora/workflows/

Local MCP access (Claude Code): `guildora-docs` server → `read_file("/internals/guildora/architecture.md")`

## Design System

- **Global reference:** https://github.com/guildora/docs/blob/main/DESIGN_SYSTEM.md — single source of truth for all design tokens.
- **Hub-specific docs:** https://github.com/guildora/docs/blob/main/internals/guildora/design-system.md
- **Themes:** `guildora-dark` (default) and `guildora-light` (Hub only). Landing is dark-only.
- **Appearance preference:** `appearancePreference` lives in `profiles.custom_fields`.
- **Font:** DM Sans (400, 500, 600, 700). Not Nunito (deprecated).
- **Default accent:** `#7C3AED` (Violet). Hub users can customize their community colors via the dynamic theme system in `apps/hub/utils/theme-colors.ts`.
- **Landing accent:** `#7C3AED` (Violet, matching hub default).
- **Component path:** `apps/hub/app/components/ui/` — `Ui*` prefixed components (UiButton, UiInput, etc.).
- **Buttons (required, internal):** All buttons in the internal hub must use the UI components from `apps/hub/app/components/ui/`.
- **Buttons (exception, external):** Public landing and CMS layouts are exempt from this button requirement.
- **Shadows:** Subtle only (`--shadow-sm/md/lg`). No neuomorphism.
- **Border radius:** 8px buttons, 12px cards, 16px modals. No sharp corners (0px) or pill buttons (9999px).
- **Rule:** No functional changes in styling PRs unless explicitly approved.

## i18n Rules (Required)

- All new UI texts, labels, buttons, hints, status messages, and ARIA texts must go through the translation system.
- New keys must be maintained in at least `de` and `en`.
- Community default locale (`community_settings.default_locale`) is the fallback for users without their own preference.
- User preference (`profiles.locale_preference`) takes precedence once saved.
- Language switching in the hub only after successful persistence of the preference (`PUT /api/profile/locale`).
- Landing (`/`) stays public and manages locale routing separately from the hub.
- Reference: https://github.com/guildora/docs/blob/main/internals/guildora/i18n-architecture.md

## Commit Recommendations for AI Agents (Required)

- AI agents should actively recommend commits, even if the user does not explicitly ask.
- A recommendation should be made when a meaningful intermediate state is reached (completed mini-task, bug fix, refactor block, i18n block, styling block without functional change).
- A recommendation should be made before risky changes (larger refactor, data model/schema change, routing/auth restructure).
- A recommendation should be made after approximately 30–90 minutes of continuous work at the latest.
- A recommendation should be made before a break or end of thread.
- No commit recommendation for purely experimental or obviously incomplete states, except as an explicit `wip:` commit.
- Always phrase the recommendation concretely: `Commit now`, `Wait a bit longer`, or `WIP commit makes sense`.
- With a commit recommendation always suggest an appropriate commit message (Conventional Commits, e.g. `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`).
- When multiple topics have been changed, the AI should recommend split commits (by logically related blocks).

## Skills

A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.

### Available skills

- openai-docs: Use when the user asks how to build with OpenAI products or APIs and needs up-to-date official documentation with citations, help choosing the latest model for a use case, or explicit GPT-5.4 upgrade and prompt-upgrade guidance; prioritize OpenAI docs MCP tools, use bundled references only as helper context, and restrict any fallback browsing to official OpenAI domains. (file: /Users/andreasbayer/.codex/skills/.system/openai-docs/SKILL.md)
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /Users/andreasbayer/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /Users/andreasbayer/.codex/skills/.system/skill-installer/SKILL.md)

### How to use skills

- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1. After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2. When `SKILL.md` references relative paths (e.g. `scripts/foo.py`), resolve them relative to the skill directory listed above first, and only consider other paths if needed.
  3. If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  4. If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  5. If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that cleanly covers the task and briefly state the order.
  - If you decide not to use an obviously applicable skill, briefly explain why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
