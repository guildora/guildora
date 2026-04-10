import { describe, it, expect } from "vitest";
import {
  sanitizeProfileNamePart,
  coerceProfileNameFromRaw,
  validateProfileNameParts,
  serializeProfileName,
  parseProfileName,
  serializeFromTemplate,
  parseWithTemplate,
  validateWithTemplate,
  PROFILE_NAME_DELIMITER,
} from "../profile-name";
import type { DisplayNameField } from "../../types/profile";

describe("PROFILE_NAME_DELIMITER", () => {
  it("is ' | '", () => {
    expect(PROFILE_NAME_DELIMITER).toBe(" | ");
  });
});

describe("sanitizeProfileNamePart", () => {
  it("replaces pipe characters with spaces", () => {
    expect(sanitizeProfileNamePart("hello|world")).toBe("hello world");
  });

  it("trims whitespace", () => {
    expect(sanitizeProfileNamePart("  hello  ")).toBe("hello");
  });

  it("truncates to 60 characters", () => {
    const long = "a".repeat(100);
    expect(sanitizeProfileNamePart(long)).toHaveLength(60);
  });

  it("handles combined sanitization", () => {
    const input = "  hello|world|foo  ";
    expect(sanitizeProfileNamePart(input)).toBe("hello world foo");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeProfileNamePart("")).toBe("");
  });
});

describe("parseProfileName", () => {
  it("parses a name without delimiter", () => {
    const result = parseProfileName("PlayerOne");
    expect(result.ingameName).toBe("PlayerOne");
    expect(result.rufname).toBeNull();
  });

  it("parses a name with delimiter", () => {
    const result = parseProfileName("PlayerOne | Andreas");
    expect(result.ingameName).toBe("PlayerOne");
    expect(result.rufname).toBe("Andreas");
  });

  it("handles empty rufname after delimiter", () => {
    // The full delimiter is " | ", so we need proper spacing
    const result = parseProfileName("PlayerOne |  X");
    expect(result.ingameName).toBe("PlayerOne");
    expect(result.rufname).toBe("X");
  });

  it("returns null rufname when delimiter part after is empty/whitespace", () => {
    const result = parseProfileName("PlayerOne |  ");
    // " | " not fully matched since trim removes trailing space
    // Input trimmed = "PlayerOne |" — no " | " found
    expect(result.ingameName).toBe("PlayerOne |");
    expect(result.rufname).toBeNull();
  });

  it("treats partial delimiter (no leading space) as part of name", () => {
    // ` | ` is the full delimiter — `|` alone is not
    const result = parseProfileName("PlayerOne|Test");
    expect(result.ingameName).toBe("PlayerOne|Test");
    expect(result.rufname).toBeNull();
  });

  it("trims whitespace", () => {
    const result = parseProfileName("  PlayerOne  |  Andreas  ");
    expect(result.ingameName).toBe("PlayerOne");
    expect(result.rufname).toBe("Andreas");
  });

  it("only splits on first delimiter occurrence", () => {
    const result = parseProfileName("A | B | C");
    expect(result.ingameName).toBe("A");
    expect(result.rufname).toBe("B | C");
  });
});

describe("serializeProfileName", () => {
  it("serializes with only ingameName", () => {
    expect(serializeProfileName({ ingameName: "Player", rufname: null })).toBe("Player");
  });

  it("serializes with ingameName and rufname", () => {
    expect(serializeProfileName({ ingameName: "Player", rufname: "Andi" })).toBe("Player | Andi");
  });

  it("treats empty rufname as null", () => {
    expect(serializeProfileName({ ingameName: "Player", rufname: "" })).toBe("Player");
  });

  it("throws on empty ingameName", () => {
    expect(() => serializeProfileName({ ingameName: "", rufname: null })).toThrow();
  });

  it("throws if ingameName contains pipe", () => {
    expect(() => serializeProfileName({ ingameName: "A|B", rufname: null })).toThrow();
  });
});

describe("validateProfileNameParts", () => {
  it("validates valid parts", () => {
    const result = validateProfileNameParts({ ingameName: "Player", rufname: "Andi" });
    expect(result.ingameName).toBe("Player");
    expect(result.rufname).toBe("Andi");
  });

  it("normalizes empty rufname to null", () => {
    const result = validateProfileNameParts({ ingameName: "Player", rufname: "" });
    expect(result.rufname).toBeNull();
  });

  it("throws on too-long ingameName", () => {
    expect(() =>
      validateProfileNameParts({ ingameName: "a".repeat(61), rufname: null })
    ).toThrow();
  });

  it("allows null rufname", () => {
    const result = validateProfileNameParts({ ingameName: "Player", rufname: null });
    expect(result.rufname).toBeNull();
  });
});

describe("coerceProfileNameFromRaw", () => {
  it("round-trips a valid name", () => {
    expect(coerceProfileNameFromRaw("PlayerOne | Andi")).toBe("PlayerOne | Andi");
  });

  it("strips pipe from parts", () => {
    expect(coerceProfileNameFromRaw("Play|er")).toBe("Play er");
  });

  it("uses fallback for empty ingameName", () => {
    expect(coerceProfileNameFromRaw("")).toBe("Member");
  });

  it("uses custom fallback", () => {
    expect(coerceProfileNameFromRaw("", "Guest")).toBe("Guest");
  });

  it("falls back to 'Member' if custom fallback is also empty-ish", () => {
    expect(coerceProfileNameFromRaw("", "")).toBe("Member");
  });
});

describe("serializeFromTemplate", () => {
  const template: DisplayNameField[] = [
    { key: "ingame", label: "Ingame Name", type: "string", required: true },
    { key: "clan", label: "Clan Tag", type: "string", required: false },
  ];

  it("serializes values matching the template", () => {
    expect(serializeFromTemplate(template, { ingame: "Player", clan: "ABC" })).toBe(
      "Player | ABC"
    );
  });

  it("trims trailing empty parts", () => {
    expect(serializeFromTemplate(template, { ingame: "Player", clan: "" })).toBe("Player");
  });

  it("uses empty string for missing keys", () => {
    expect(serializeFromTemplate(template, { ingame: "Player" })).toBe("Player");
  });

  it("sanitizes pipe characters in values", () => {
    expect(serializeFromTemplate(template, { ingame: "A|B", clan: "C" })).toBe("A B | C");
  });
});

describe("parseWithTemplate", () => {
  const template: DisplayNameField[] = [
    { key: "ingame", label: "Ingame Name", type: "string", required: true },
    { key: "clan", label: "Clan Tag", type: "string", required: false },
  ];

  it("parses a delimited display name into template fields", () => {
    const result = parseWithTemplate("Player | ABC", template);
    expect(result).toEqual({ ingame: "Player", clan: "ABC" });
  });

  it("fills missing segments with empty strings", () => {
    const result = parseWithTemplate("Player", template);
    expect(result).toEqual({ ingame: "Player", clan: "" });
  });

  it("handles extra segments (ignored)", () => {
    const result = parseWithTemplate("Player | ABC | Extra", template);
    expect(result.ingame).toBe("Player");
    expect(result.clan).toBe("ABC");
  });
});

describe("validateWithTemplate", () => {
  const template: DisplayNameField[] = [
    { key: "ingame", label: "Ingame Name", type: "string", required: true },
    { key: "clan", label: "Clan Tag", type: "string", required: false },
  ];

  it("passes valid values", () => {
    const result = validateWithTemplate(template, { ingame: "Player", clan: "ABC" });
    expect(result).toEqual({ ingame: "Player", clan: "ABC" });
  });

  it("throws on missing required field", () => {
    expect(() => validateWithTemplate(template, { ingame: "", clan: "ABC" })).toThrow(
      '"Ingame Name" is required'
    );
  });

  it("allows empty optional field", () => {
    const result = validateWithTemplate(template, { ingame: "Player", clan: "" });
    expect(result.clan).toBe("");
  });

  it("sanitizes pipe characters", () => {
    const result = validateWithTemplate(template, { ingame: "A|B", clan: "" });
    expect(result.ingame).toBe("A B");
  });
});
