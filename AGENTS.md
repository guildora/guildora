# Newguild – Kontext für KI und Agenten

Newguild ist eine Community-Plattform (Web, Landing Page, Discord-Bot) mit gemeinsamer Postgres-Datenbank und Drizzle-Schema.

## Struktur

- **apps/web** – Nuxt 4, Nutzer- und Mod-UI; API unter `server/api/` (Nitro, file-based).
- **apps/cms** – Payload CMS 3 + Next.js; Landing Page / redaktionelle Inhalte (Seiten, Medien).
- **apps/bot** – Discord-Bot; Voice-Tracking, interner Sync `POST /internal/sync-user` (Bearer).
- **packages/shared** – Drizzle-Schema, Typen, Zod (App-Manifest), DB-Client, Migrationen.

## Rollen (Permission)

- **temporaer** (Bewerber), **user**, **moderator**, **admin**, **superadmin**. Session enthält `permissionRoles` (kanonisch).
- Community-Rollen (z. B. Bewerber, Anwaerter, Mitglied) sind fachlich; jede ist einer Permission-Rolle zugeordnet.

## Wichtige Konventionen

- **API:** Methode via Dateisuffix (`.get`, `.post`, `.put`, `.delete`). Auth: `requireSession` + `requireRole(..., ["admin","superadmin"])` etc.
- **Bewerbungen** = Mod-Bereich „applications“ (Mitglieder-Bewerbungen).
- **Submissions** = Marketplace-App-Einreichungen (`marketplace/submissions`, `app_marketplace_submissions`).
- **Dokumentation:** `docs/` (domain-model, workflows, api-contracts, permissions-matrix), `ai/` (actions, routes, schemas).

## Design System (Web)

- **Quelle:** `docs/design-system-retromorphism.md` und Figma `RetroMorphism--Community-`.
- **Themes:** `retromorphism-light` und `retromorphism-dark`; User-Preference `appearancePreference` (`light|dark|system`) im Profil.
- **Fonts:** `Nunito` als Standard fuer produktive UI.
- **Template-Pfad:** `apps/web/app/components/ui/` ist die bevorzugte Basis fuer neue UI-Bausteine.
- **Buttons (Pflicht, intern):** Alle Buttons im internen Web-Bereich (eingeloggte App) muessen Retro-konform sein und auf den UI-Templates/Klassen aus `apps/web/app/components/ui/` und `docs/design-system-retromorphism.md` basieren.
- **Buttons (Ausnahme, extern):** Oeffentliche/CMS-Layouts sind von dieser Button-Pflicht ausgenommen; deren Design soll spaeter ueber CMS-Vorgaben steuerbar bleiben.
- **Regel:** Keine Funktionsänderung durch Styling-PRs, außer explizit freigegeben.

## Für Agenten

- Kein MCP-Server im Repo (geplant). API ist session-basiert; für Maschinenzugriff sind API-Key/OAuth und MCP-Adapter vorgesehen.
- Aktionen und Berechtigungen: `ai/actions.registry.json`, `docs/permissions-matrix.md`.
- Domänenmodell: `docs/domain-model.md`. Workflows: `docs/workflows/`.

## i18n-Regeln (Pflicht)

- Alle neuen UI-Texte, Labels, Buttons, Hinweise, Statusmeldungen und ARIA-Texte müssen über das Übersetzungssystem laufen.
- Neue Keys müssen mindestens in `de` und `en` gepflegt werden.
- Community-Default-Sprache (`community_settings.default_locale`) ist der Fallback für User ohne eigene Präferenz.
- User-Präferenz (`profiles.locale_preference`) hat Vorrang, sobald gespeichert.
- Sprachwechsel im UI erst nach erfolgreichem Persistieren der Präferenz (`PUT /api/profile/locale`).
- Landing (`/`) ist von der Community-Default-Autoanwendung ausgenommen.
- Referenzdokument: `docs/i18n-architecture.md`.
