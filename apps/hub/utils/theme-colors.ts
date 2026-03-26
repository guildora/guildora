import type { ResolvedAppearanceMode } from "./appearance";

export type ThemeContentTone = "light" | "dark";

export interface ThemeColors {
  colorDominant: string;
  colorSecondary: string;
  colorAccent: string;
  colorAccentContentTone: ThemeContentTone;
  colorInfo: string;
  colorInfoContentTone: ThemeContentTone;
  colorSuccess: string;
  colorSuccessContentTone: ThemeContentTone;
  colorWarning: string;
  colorWarningContentTone: ThemeContentTone;
  colorError: string;
  colorErrorContentTone: ThemeContentTone;
}

export const GUILDORA_LIGHT_THEME = "guildora-light";
export const GUILDORA_DARK_THEME = "guildora-dark";

export const defaultThemeColors: ThemeColors = {
  colorDominant: "#0A0A0A",
  colorSecondary: "#FAFAFA",
  colorAccent: "#7C3AED",
  colorAccentContentTone: "light",
  colorInfo: "#3B82F6",
  colorInfoContentTone: "light",
  colorSuccess: "#22C55E",
  colorSuccessContentTone: "light",
  colorWarning: "#F59E0B",
  colorWarningContentTone: "dark",
  colorError: "#EF4444",
  colorErrorContentTone: "light"
} as const;

const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
const themeContentToneSet = new Set<ThemeContentTone>(["light", "dark"]);

function normalizeHexColor(value: string | undefined, fallback: string): string {
  if (!value || !hexColorRegex.test(value)) {
    return fallback;
  }

  return value.toLowerCase();
}

function normalizeContentTone(value: string | undefined, fallback: ThemeContentTone): ThemeContentTone {
  if (!value) {
    return fallback;
  }
  const normalized = value.toLowerCase();
  return themeContentToneSet.has(normalized as ThemeContentTone) ? (normalized as ThemeContentTone) : fallback;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const int = Number.parseInt(normalized, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function toHex(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, "0");
}

function blendColors(baseHex: string, mixHex: string, mixRatio: number): string {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);
  const ratio = Math.max(0, Math.min(1, mixRatio));

  const r = base.r + (mix.r - base.r) * ratio;
  const g = base.g + (mix.g - base.g) * ratio;
  const b = base.b + (mix.b - base.b) * ratio;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${normalizedAlpha.toFixed(2)})`;
}

export function normalizeThemeColors(colors: Partial<ThemeColors> | undefined | null): ThemeColors {
  return {
    colorDominant: normalizeHexColor(colors?.colorDominant, defaultThemeColors.colorDominant),
    colorSecondary: normalizeHexColor(colors?.colorSecondary, defaultThemeColors.colorSecondary),
    colorAccent: normalizeHexColor(colors?.colorAccent, defaultThemeColors.colorAccent),
    colorAccentContentTone: normalizeContentTone(colors?.colorAccentContentTone, defaultThemeColors.colorAccentContentTone),
    colorInfo: normalizeHexColor(colors?.colorInfo, defaultThemeColors.colorInfo),
    colorInfoContentTone: normalizeContentTone(colors?.colorInfoContentTone, defaultThemeColors.colorInfoContentTone),
    colorSuccess: normalizeHexColor(colors?.colorSuccess, defaultThemeColors.colorSuccess),
    colorSuccessContentTone: normalizeContentTone(
      colors?.colorSuccessContentTone,
      defaultThemeColors.colorSuccessContentTone
    ),
    colorWarning: normalizeHexColor(colors?.colorWarning, defaultThemeColors.colorWarning),
    colorWarningContentTone: normalizeContentTone(
      colors?.colorWarningContentTone,
      defaultThemeColors.colorWarningContentTone
    ),
    colorError: normalizeHexColor(colors?.colorError, defaultThemeColors.colorError),
    colorErrorContentTone: normalizeContentTone(colors?.colorErrorContentTone, defaultThemeColors.colorErrorContentTone)
  };
}

export function resolveThemeName(mode: ResolvedAppearanceMode): string {
  return mode === "dark" ? GUILDORA_DARK_THEME : GUILDORA_LIGHT_THEME;
}

export function buildThemeCssVariables(
  colors: Partial<ThemeColors> | undefined | null,
  mode: ResolvedAppearanceMode = "dark"
): Record<string, string> {
  const normalized = normalizeThemeColors(colors);

  const dominant = normalized.colorDominant;
  const accent = normalized.colorAccent;
  const baseInk = "#001429";
  const white = "#ffffff";

  const surface0 = mode === "dark" ? dominant : blendColors(dominant, "#ffffff", 0.95);
  const surface1 = mode === "dark" ? dominant : blendColors(dominant, "#ffffff", 0.93);
  const surface2 = mode === "dark" ? blendColors(dominant, "#ffffff", 0.05) : blendColors(dominant, "#ffffff", 0.89);
  const surface3 = mode === "dark" ? blendColors(dominant, "#ffffff", 0.1) : blendColors(dominant, "#ffffff", 0.84);
  const surface4 = mode === "dark" ? blendColors(dominant, "#ffffff", 0.16) : blendColors(dominant, "#ffffff", 0.78);
  const surface5 = mode === "dark" ? blendColors(dominant, "#ffffff", 0.22) : blendColors(dominant, "#ffffff", 0.72);

  const dominant200 = mode === "dark" ? blendColors(dominant, "#ffffff", 0.06) : blendColors(dominant, "#ffffff", 0.86);
  const dominant300 = mode === "dark" ? blendColors(dominant, "#ffffff", 0.12) : blendColors(dominant, "#ffffff", 0.82);
  const dominant400 = mode === "dark" ? blendColors(dominant, "#ffffff", 0.18) : blendColors(dominant, "#ffffff", 0.75);
  const dominantNeutral = mode === "dark" ? blendColors(dominant, "#ffffff", 0.24) : blendColors(dominant, "#ffffff", 0.68);

  const textPrimary = mode === "dark" ? normalized.colorSecondary : blendColors(dominant, baseInk, 0.86);
  const textSecondary = hexToRgba(textPrimary, mode === "dark" ? 0.75 : 0.72);
  const textTertiary = hexToRgba(textPrimary, mode === "dark" ? 0.5 : 0.56);
  const textDisabled = hexToRgba(textPrimary, mode === "dark" ? 0.3 : 0.38);

  const accentLight = blendColors(accent, "#ffffff", mode === "dark" ? 0.25 : 0.35);
  const accentDark = blendColors(accent, "#000000", mode === "dark" ? 0.2 : 0.14);
  const accentMuted = mode === "dark" ? blendColors(dominant, accent, 0.25) : blendColors("#ffffff", accent, 0.18);
  const accentSubtle = mode === "dark" ? blendColors(dominant, accent, 0.12) : blendColors("#ffffff", accent, 0.1);

  const accentBorder = hexToRgba(textPrimary, mode === "dark" ? 0.12 : 0.2);
  const accentBorderActive = hexToRgba(textPrimary, mode === "dark" ? 0.2 : 0.28);
  const accentGlow = hexToRgba(accent, mode === "dark" ? 0.32 : 0.24);

  const line = hexToRgba(textPrimary, mode === "dark" ? 0.2 : 0.14);
  const shadowSm = mode === "dark"
    ? `0 1px 3px ${hexToRgba("#000000", 0.12)}, 0 1px 2px ${hexToRgba("#000000", 0.08)}`
    : `0 1px 3px ${hexToRgba("#000000", 0.06)}, 0 1px 2px ${hexToRgba("#000000", 0.04)}`;
  const shadowMd = mode === "dark"
    ? `0 4px 16px ${hexToRgba("#000000", 0.12)}`
    : `0 4px 16px ${hexToRgba("#000000", 0.06)}`;
  const shadowLg = mode === "dark"
    ? `0 8px 32px ${hexToRgba("#000000", 0.16)}`
    : `0 8px 32px ${hexToRgba("#000000", 0.08)}`;
  const btnOutlineBorder = hexToRgba(textPrimary, mode === "dark" ? 0.35 : 0.3);
  const btnGhostHover = hexToRgba(textPrimary, mode === "dark" ? 0.08 : 0.06);
  const accentContent = normalized.colorAccentContentTone === "light" ? white : baseInk;
  const infoContent = normalized.colorInfoContentTone === "light" ? white : baseInk;
  const successContent = normalized.colorSuccessContentTone === "light" ? white : baseInk;
  const warningContent = normalized.colorWarningContentTone === "light" ? white : baseInk;
  const errorContent = normalized.colorErrorContentTone === "light" ? white : baseInk;

  return {
    "--color-dominant": dominant,
    "--color-surface-0": surface0,
    "--color-surface-1": surface1,
    "--color-surface-2": surface2,
    "--color-surface-3": surface3,
    "--color-surface-4": surface4,
    "--color-surface-5": surface5,
    "--color-dominant-200": dominant200,
    "--color-dominant-300": dominant300,
    "--color-dominant-400": dominant400,
    "--color-dominant-neutral": dominantNeutral,
    "--color-secondary": normalized.colorSecondary,
    "--color-text-primary": textPrimary,
    "--color-text-secondary": textSecondary,
    "--color-text-tertiary": textTertiary,
    "--color-text-disabled": textDisabled,
    "--color-accent": accent,
    "--color-accent-light": accentLight,
    "--color-accent-dark": accentDark,
    "--color-accent-muted": accentMuted,
    "--color-accent-subtle": accentSubtle,
    "--color-accent-border": accentBorder,
    "--color-accent-border-active": accentBorderActive,
    "--color-accent-glow": accentGlow,
    "--color-line": line,
    "--shadow-sm": shadowSm,
    "--shadow-md": shadowMd,
    "--shadow-lg": shadowLg,
    "--color-btn-outline-border": btnOutlineBorder,
    "--color-btn-ghost-hover": btnGhostHover,
    "--color-info": normalized.colorInfo,
    "--color-info-content": infoContent,
    "--color-success": normalized.colorSuccess,
    "--color-success-content": successContent,
    "--color-warning": normalized.colorWarning,
    "--color-warning-content": warningContent,
    "--color-error": normalized.colorError,
    "--color-error-content": errorContent,
    "--color-base-100": "var(--color-surface-1)",
    "--color-base-200": "var(--color-surface-2)",
    "--color-base-300": "var(--color-surface-3)",
    "--color-base-content": "var(--color-text-primary)",
    "--color-primary": "var(--color-accent)",
    "--color-primary-content": "var(--color-accent-content)",
    "--color-secondary-content": "var(--color-text-primary)",
    "--color-accent-content": accentContent,
    "--color-neutral": "var(--color-surface-3)"
  };
}

export function buildThemeHtmlStyle(
  colors: Partial<ThemeColors> | undefined | null,
  mode: ResolvedAppearanceMode = "dark"
): string {
  const variables = buildThemeCssVariables(colors, mode);
  const declarations = Object.entries(variables).map(([name, value]) => `${name}:${value}`);
  const colorScheme = mode === "dark" ? "dark" : "light";

  return [`color-scheme:${colorScheme}`, ...declarations].join(";");
}

export function applyThemeColorsToDom(
  colors: Partial<ThemeColors> | undefined | null,
  mode: ResolvedAppearanceMode = "dark"
): ThemeColors {
  const normalized = normalizeThemeColors(colors);

  if (!import.meta.client) {
    return normalized;
  }

  const variables = buildThemeCssVariables(normalized, mode);
  const root = document.documentElement;

  root.setAttribute("data-theme", resolveThemeName(mode));

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }

  root.style.setProperty("color-scheme", mode);

  return normalized;
}
