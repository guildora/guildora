import { describe, it, expect } from "vitest";
import {
  isValidHexColor,
  sanitizeLandingColorOverrides,
  sanitizePerTemplateColorOverrides,
  migrateColorOverrides,
  resolveLandingColors,
  landingColorsToCssVars,
  landingColorsToStyleString,
  LANDING_COLOR_KEYS,
  TEMPLATE_COLOR_DEFAULTS,
  STYLE_VARIANTS,
} from "../landing-colors";

describe("isValidHexColor", () => {
  it("accepts valid 6-digit hex colors", () => {
    expect(isValidHexColor("#000000")).toBe(true);
    expect(isValidHexColor("#ffffff")).toBe(true);
    expect(isValidHexColor("#ABCDEF")).toBe(true);
    expect(isValidHexColor("#7c3aed")).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(isValidHexColor("#fff")).toBe(false); // 3-digit
    expect(isValidHexColor("#gggggg")).toBe(false); // invalid chars
    expect(isValidHexColor("000000")).toBe(false); // no hash
    expect(isValidHexColor("#0000000")).toBe(false); // too long
    expect(isValidHexColor("")).toBe(false);
    expect(isValidHexColor(null)).toBe(false);
    expect(isValidHexColor(undefined)).toBe(false);
    expect(isValidHexColor(123)).toBe(false);
  });
});

describe("LANDING_COLOR_KEYS", () => {
  it("contains all expected keys", () => {
    expect(LANDING_COLOR_KEYS).toEqual([
      "background",
      "surface",
      "text",
      "textMuted",
      "accent",
      "accentText",
      "border",
    ]);
  });
});

describe("STYLE_VARIANTS", () => {
  it("contains normal, accent, warning", () => {
    expect(STYLE_VARIANTS).toEqual(["normal", "accent", "warning"]);
  });
});

describe("sanitizeLandingColorOverrides", () => {
  it("keeps valid hex color overrides", () => {
    const result = sanitizeLandingColorOverrides({
      accent: "#ff0000",
      background: "#000000",
    });
    expect(result).toEqual({ accent: "#ff0000", background: "#000000" });
  });

  it("lowercases hex values", () => {
    const result = sanitizeLandingColorOverrides({ accent: "#FF00FF" });
    expect(result).toEqual({ accent: "#ff00ff" });
  });

  it("strips invalid color values", () => {
    const result = sanitizeLandingColorOverrides({
      accent: "#ff0000",
      background: "not-a-color",
      text: 42,
    });
    expect(result).toEqual({ accent: "#ff0000" });
  });

  it("strips unknown keys", () => {
    const result = sanitizeLandingColorOverrides({
      accent: "#ff0000",
      unknownKey: "#00ff00",
    });
    expect(result).toEqual({ accent: "#ff0000" });
  });

  it("returns empty object for null/undefined", () => {
    expect(sanitizeLandingColorOverrides(null)).toEqual({});
    expect(sanitizeLandingColorOverrides(undefined)).toEqual({});
  });

  it("returns empty object for non-object input", () => {
    expect(sanitizeLandingColorOverrides("string" as any)).toEqual({});
  });
});

describe("sanitizePerTemplateColorOverrides", () => {
  it("sanitizes each template's overrides", () => {
    const result = sanitizePerTemplateColorOverrides({
      default: { accent: "#ff0000", bad: "nope" },
      cyberpunk: { background: "#112233" },
    });

    expect(result).toEqual({
      default: { accent: "#ff0000" },
      cyberpunk: { background: "#112233" },
    });
  });

  it("strips templates with no valid overrides", () => {
    const result = sanitizePerTemplateColorOverrides({
      default: { bad: "nope" },
      cyberpunk: { background: "#112233" },
    });

    expect(result).toEqual({ cyberpunk: { background: "#112233" } });
  });

  it("returns empty for null/undefined", () => {
    expect(sanitizePerTemplateColorOverrides(null)).toEqual({});
    expect(sanitizePerTemplateColorOverrides(undefined)).toEqual({});
  });

  it("skips non-object template values", () => {
    const result = sanitizePerTemplateColorOverrides({
      default: "not an object",
      valid: { accent: "#ff0000" },
    } as any);

    expect(result).toEqual({ valid: { accent: "#ff0000" } });
  });

  it("skips array template values", () => {
    const result = sanitizePerTemplateColorOverrides({
      default: [1, 2, 3],
    } as any);

    expect(result).toEqual({});
  });
});

describe("migrateColorOverrides", () => {
  it("wraps legacy flat format under active template", () => {
    const result = migrateColorOverrides({ accent: "#ff0000" }, "cyberpunk");
    expect(result).toEqual({ cyberpunk: { accent: "#ff0000" } });
  });

  it("passes through already per-template format", () => {
    const result = migrateColorOverrides(
      { default: { accent: "#ff0000" } },
      "cyberpunk"
    );
    expect(result).toEqual({ default: { accent: "#ff0000" } });
  });

  it("returns empty for null/undefined", () => {
    expect(migrateColorOverrides(null, "default")).toEqual({});
    expect(migrateColorOverrides(undefined, "default")).toEqual({});
  });

  it("returns empty for empty object", () => {
    expect(migrateColorOverrides({}, "default")).toEqual({});
  });

  it("sanitizes legacy values", () => {
    const result = migrateColorOverrides(
      { accent: "#ff0000", bad: "not-hex" },
      "default"
    );
    expect(result).toEqual({ default: { accent: "#ff0000" } });
  });

  it("returns empty if legacy values are all invalid", () => {
    const result = migrateColorOverrides({ bad: "not-hex" }, "default");
    expect(result).toEqual({});
  });
});

describe("resolveLandingColors", () => {
  it("returns default palette when no template specified", () => {
    const result = resolveLandingColors(null, null);
    expect(result).toEqual(TEMPLATE_COLOR_DEFAULTS.default);
  });

  it("returns template-specific palette", () => {
    const result = resolveLandingColors("cyberpunk", null);
    expect(result).toEqual(TEMPLATE_COLOR_DEFAULTS.cyberpunk);
  });

  it("falls back to default for unknown template", () => {
    const result = resolveLandingColors("nonexistent", null);
    expect(result).toEqual(TEMPLATE_COLOR_DEFAULTS.default);
  });

  it("merges overrides into template palette", () => {
    const result = resolveLandingColors("default", { accent: "#ff0000" });
    expect(result.accent).toBe("#ff0000");
    expect(result.background).toBe(TEMPLATE_COLOR_DEFAULTS.default.background);
  });

  it("lowercases override values", () => {
    const result = resolveLandingColors("default", { accent: "#FF00FF" });
    expect(result.accent).toBe("#ff00ff");
  });

  it("ignores invalid overrides", () => {
    const result = resolveLandingColors("default", { accent: "not-hex" } as any);
    expect(result.accent).toBe(TEMPLATE_COLOR_DEFAULTS.default.accent);
  });

  it("returns a new object (no mutation)", () => {
    const result = resolveLandingColors("default", null);
    expect(result).not.toBe(TEMPLATE_COLOR_DEFAULTS.default);
    expect(result).toEqual(TEMPLATE_COLOR_DEFAULTS.default);
  });
});

describe("landingColorsToCssVars", () => {
  it("maps palette to CSS custom properties", () => {
    const palette = TEMPLATE_COLOR_DEFAULTS.default;
    const vars = landingColorsToCssVars(palette);

    expect(vars["--landing-background"]).toBe(palette.background);
    expect(vars["--landing-surface"]).toBe(palette.surface);
    expect(vars["--landing-text"]).toBe(palette.text);
    expect(vars["--landing-text-muted"]).toBe(palette.textMuted);
    expect(vars["--landing-accent"]).toBe(palette.accent);
    expect(vars["--landing-accent-text"]).toBe(palette.accentText);
    expect(vars["--landing-border"]).toBe(palette.border);
  });

  it("returns exactly 7 CSS variables", () => {
    const vars = landingColorsToCssVars(TEMPLATE_COLOR_DEFAULTS.default);
    expect(Object.keys(vars)).toHaveLength(7);
  });
});

describe("landingColorsToStyleString", () => {
  it("creates a semicolon-separated style string", () => {
    const palette = TEMPLATE_COLOR_DEFAULTS.default;
    const style = landingColorsToStyleString(palette);

    expect(style).toContain("--landing-background:" + palette.background);
    expect(style).toContain("--landing-accent:" + palette.accent);
    // Should not have spaces around colons (inline style format)
    expect(style).not.toContain(": ");
    // Count semicolons (6 separators for 7 entries)
    expect(style.split(";").length).toBe(7);
  });
});

describe("TEMPLATE_COLOR_DEFAULTS", () => {
  it("has default, cyberpunk, and esports templates", () => {
    expect(TEMPLATE_COLOR_DEFAULTS).toHaveProperty("default");
    expect(TEMPLATE_COLOR_DEFAULTS).toHaveProperty("cyberpunk");
    expect(TEMPLATE_COLOR_DEFAULTS).toHaveProperty("esports");
  });

  it("all templates have valid hex colors for all keys", () => {
    for (const [, palette] of Object.entries(TEMPLATE_COLOR_DEFAULTS)) {
      for (const key of LANDING_COLOR_KEYS) {
        expect(isValidHexColor(palette[key])).toBe(true);
      }
    }
  });
});
