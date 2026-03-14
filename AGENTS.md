# Newguild - Kontext fuer KI und Agenten

Newguild ist eine Community-Plattform mit oeffentlicher Landing Page, internem Hub, Payload CMS, Discord-Bot und gemeinsamer Postgres-Datenbank mit Drizzle-Schema.

## Struktur

- **apps/web** - Nuxt 4, oeffentliche Landing Page, CMS-Rendering, Login-CTA und OAuth-Redirect-Shim unter `server/api/auth/discord.get.ts`.
- **apps/hub** - Nuxt 4, interne Nutzer-, Mod- und Admin-UI; Nitro-API unter `server/api/`; echte Discord-OAuth-Session-Logik; eingebettetes CMS-SSO.
- **apps/cms** - Payload CMS 3 + Next.js; redaktionelle Inhalte, Seiten, Medien, Site Settings und CMS-User.
- **apps/bot** - Discord-Bot; Voice-Tracking, Guild-Sync, Slash-Command-Setup und interner Sync-Server.
- **packages/shared** - Drizzle-Schema, Typen, Zod-App-Manifest, DB-Client, Migrationen, Seeds und Shared Utilities.

## Rollen (Permission)

- **temporaer**, **user**, **moderator**, **admin**, **superadmin**.
- Sessions enthalten kanonisch `permissionRoles`.
- `roles` ist nur Legacy-Kompatibilitaet und nicht die primaere Quelle.
- Community-Rollen (z. B. Bewerber, Anwaerter, Mitglied) sind fachlich; jede ist genau einer Permission-Rolle zugeordnet.

## Wichtige Konventionen

- **API:** Methode via Dateisuffix (`.get`, `.post`, `.put`, `.delete`).
- **Auth:** Server-seitig ueber `requireSession`, `requireModeratorSession`, `requireAdminSession` oder `requireRole(...)`.
- **Landing vs. Hub:** `apps/web` bleibt oeffentlich; interne Workflows und operative APIs gehoeren in `apps/hub`.
- **OAuth:** Die echte Discord-OAuth-Callback-Logik lebt in `apps/hub/server/api/auth/discord.get.ts`. Die Landing-Route unter `apps/web/server/api/auth/discord.get.ts` leitet nur weiter.
- **Bewerbungen** = Mod-Bereich `applications` (Mitglieder-Bewerbungen).
- **Submissions** = Marketplace-App-Einreichungen (`app_marketplace_submissions`); lokaler Full-Review-Flow ist derzeit nicht aktiv.
- **Dokumentation:** `docs/` ist kanonisch fuer Architektur, Flows, API, Routing und Berechtigungen. `ai/` enthaelt Skills und JSON-Manifeste fuer Agenten.

## Design System (Hub)

- **Quelle:** `docs/design-system-retromorphism.md`.
- **Themes:** `retromorphism-light` und `retromorphism-dark`.
- **Appearance-Praferenz:** `appearancePreference` lebt in `profiles.custom_fields`.
- **Fonts:** `Nunito` als produktive UI-Basis.
- **Template-Pfad:** `apps/hub/app/components/ui/` ist die bevorzugte Basis fuer neue interne UI-Bausteine.
- **Buttons (Pflicht, intern):** Alle Buttons im internen Hub muessen Retro-konform sein und auf den UI-Templates/Klassen aus `apps/hub/app/components/ui/` und `docs/design-system-retromorphism.md` basieren.
- **Buttons (Ausnahme, extern):** Oeffentliche Landing- und CMS-Layouts sind von dieser Button-Pflicht ausgenommen.
- **Regel:** Keine Funktionsaenderung durch Styling-PRs, ausser explizit freigegeben.

## Fuer Agenten

- Kein MCP-Server im Repo. API ist session-basiert; fuer Maschinenzugriff waeren spaeter API-Key-, OAuth- oder MCP-Adapter noetig.
- Aktionen und API-Oberflaeche: `ai/actions.registry.json`, `ai/resources/resources.manifest.json`, `docs/api-contracts.md`.
- Domainenmodell: `docs/domain-model.md`.
- Routing und Ownership: `docs/routing-and-navigation.md`.
- Workflows: `docs/workflows/`.
- Wenn sich Routen, Berechtigungen, Tabellen oder Workflows aendern, muessen `docs/`, `ai/` und diese Agent-Anweisungen im selben Change mitgezogen werden.

## i18n-Regeln (Pflicht)

- Alle neuen UI-Texte, Labels, Buttons, Hinweise, Statusmeldungen und ARIA-Texte muessen ueber das Uebersetzungssystem laufen.
- Neue Keys muessen mindestens in `de` und `en` gepflegt werden.
- Community-Default-Sprache (`community_settings.default_locale`) ist der Fallback fuer User ohne eigene Praeferenz.
- User-Praeferenz (`profiles.locale_preference`) hat Vorrang, sobald gespeichert.
- Sprachwechsel im Hub erst nach erfolgreichem Persistieren der Praeferenz (`PUT /api/profile/locale`).
- Landing (`/`) bleibt oeffentlich und verwaltet Locale-Routing getrennt vom Hub.
- Referenzdokument: `docs/i18n-architecture.md`.

## Commit-Empfehlungen fuer KI-Agenten (Pflicht)

- KI-Agenten sollen aktiv Commit-Empfehlungen geben, auch wenn der User nicht explizit danach fragt.
- Eine Empfehlung soll erfolgen, wenn ein sinnvoller Zwischenstand erreicht ist (abgeschlossener Mini-Task, Bugfix, Refactor-Block, i18n-Block, Styling-Block ohne Funktionsaenderung).
- Eine Empfehlung soll vor riskanten Aenderungen erfolgen (groesserer Refactor, Datenmodell-/Schema-Aenderung, Routing-/Auth-Umbau).
- Eine Empfehlung soll spaetestens nach ca. 30-90 Minuten zusammenhaengender Arbeit erfolgen.
- Eine Empfehlung soll vor Pause oder Thread-Ende erfolgen.
- Keine Commit-Empfehlung fuer rein experimentelle oder offensichtlich unvollstaendige Zwischenstaende, ausser als expliziter `wip:`-Commit.
- Empfehlung immer konkret formulieren: `Jetzt committen`, `Noch warten`, oder `WIP-Commit sinnvoll`.
- Bei Commit-Empfehlung immer eine passende Commit-Message vorschlagen (Conventional Commits, z. B. `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`).
- Wenn mehrere Themen geaendert wurden, soll die KI Split-Commits empfehlen (nach fachlich zusammenhaengenden Bloecken).

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
  - If multiple skills apply, choose the minimale Menge, die die Aufgabe sauber abdeckt, und nenne kurz die Reihenfolge.
  - Wenn du eine naheliegende Skill nicht nutzt, sage kurz warum.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
