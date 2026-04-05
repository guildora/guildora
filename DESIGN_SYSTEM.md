# Design System — Landing Page Templates

> This file documents the landing page color and template system implemented in GUILD-30.
> For the full platform design system, see https://github.com/guildora/docs/blob/main/DESIGN_SYSTEM.md

## Color System

All landing page colors flow through 7 CSS custom-properties, set as inline styles on the root `[data-template]` element:

| Variable | Purpose |
|---|---|
| `--landing-background` | Page / body background |
| `--landing-surface` | Card / section surface |
| `--landing-text` | Primary text color |
| `--landing-text-muted` | Secondary / muted text |
| `--landing-accent` | Primary accent (buttons, links, highlights) |
| `--landing-accent-text` | Text on accent backgrounds |
| `--landing-border` | Subtle borders and dividers |

### Resolution Order

1. **Template defaults** — defined in `packages/shared/src/landing-colors.ts` (`TEMPLATE_COLOR_DEFAULTS`)
2. **Guild overrides** — stored as `color_overrides` JSONB on `landing_pages` table
3. Merged result is rendered as inline CSS variables on the root element

Only valid 6-digit hex colors (`#rrggbb`) are accepted. Invalid overrides are silently dropped.

## Templates

### Default

- **Palette:** Dark neutral (`#0a0a0a` background, `#7c3aed` violet accent)
- **CSS:** No dedicated file — `landing.css` IS the default styling
- **Character:** Clean, minimal, suitable for any community

### Cyberpunk

- **Palette:** Deep blue-dark (`#0a0a12` background, `#00f0ff` cyan accent)
- **CSS:** `apps/web/app/assets/css/cyberpunk.css`
- **Scoped via:** `[data-template="cyberpunk"]`
- **Character:** Neon glass-morphism, glow effects, uppercase headings, gradient buttons
- **Supplemental tokens:** `--cp-neon-cyan`, `--cp-neon-magenta`, `--cp-neon-purple`, `--cp-glow-*`

### eSports

- **Palette:** Dark steel (`#0b0e14` background, `#e53e3e` red accent)
- **CSS:** `apps/web/app/assets/css/esports.css`
- **Scoped via:** `[data-template="esports"]`
- **Character:** Professional, bold, competitive — sharp geometry, uppercase headings, red accents
- **Supplemental tokens:** `--es-red`, `--es-red-bright`, `--es-gold`

## Semantic CSS Classes

All landing blocks use semantic `.landing-*` classes defined in `apps/web/app/assets/css/landing.css`. Template stylesheets override these classes under their `[data-template]` scope.

| Class | Usage |
|---|---|
| `.landing-card` | Card / surface containers |
| `.landing-btn-primary` | Primary action buttons |
| `.landing-btn-outline` | Ghost / outline buttons |
| `.landing-eyebrow` | Badge / eyebrow labels |
| `.landing-section-title` | Section headings |
| `.landing-text-muted` | Muted / secondary text |
| `.landing-stat-value` | Stat number highlights |
| `.landing-step-indicator` | Step numbers (HowItWorks) |
| `.landing-divider` | Connector / divider lines |
| `.landing-accent-bg` | Accent background sections (CTA) |

## Style Variants

Individual blocks support a `styleVariant` config property rendered as `data-style-variant` on the block root:

- `normal` — default styling (no override)
- `accent` — accent-tinted cards and elements
- `warning` — warning-colored (amber/gold) elements

Each template CSS file provides its own variant overrides.

## Adding a New Template

1. Add color defaults to `TEMPLATE_COLOR_DEFAULTS` in `packages/shared/src/landing-colors.ts`
2. Add template seed in `packages/shared/src/db/seeds/landing-templates.ts`
3. Create `apps/web/app/assets/css/{template-id}.css` scoped under `[data-template="{template-id}"]`
4. Register the CSS file in `apps/web/nuxt.config.ts` → `css` array
5. Override `.landing-*` classes as needed — no component markup changes required

## Architecture Notes

- Template scoping: `[data-template="template-id"]` attribute on root `div` in `pages/index.vue`
- Block rendering: `LandingBlockRenderer.vue` resolves components by block type, passes `data-style-variant`
- Color injection: `landingColorsToStyleString()` generates inline CSS from resolved palette
- Custom CSS: guilds can inject additional CSS via `customCss` field (rendered as `<style>` tag)
- Preview: PostMessage protocol enables real-time preview updates in the admin editor iframe
