import { describe, expect, it } from "vitest";
import {
  normalizeCommunityDefaultLocale,
  normalizeUserLocalePreference,
  parseLocalePreference,
  resolveEffectiveLocale
} from "../locale-preference";

describe("locale preference resolver", () => {
  it("parses only supported locale codes", () => {
    expect(parseLocalePreference("de")).toBe("de");
    expect(parseLocalePreference("EN")).toBe("en");
    expect(parseLocalePreference("fr")).toBeNull();
    expect(parseLocalePreference(null)).toBeNull();
  });

  it("normalizes user and community locale values with fallbacks", () => {
    expect(normalizeUserLocalePreference("de", null)).toBe("de");
    expect(normalizeUserLocalePreference("invalid", null)).toBeNull();
    expect(normalizeCommunityDefaultLocale("de", "en")).toBe("de");
    expect(normalizeCommunityDefaultLocale("invalid", "en")).toBe("en");
  });

  it("resolves effective locale with priority user > community > system", () => {
    expect(
      resolveEffectiveLocale({
        userLocalePreference: "de",
        communityDefaultLocale: "en"
      })
    ).toEqual({ locale: "de", source: "user" });

    expect(
      resolveEffectiveLocale({
        userLocalePreference: null,
        communityDefaultLocale: "de"
      })
    ).toEqual({ locale: "de", source: "community" });

    expect(
      resolveEffectiveLocale({
        userLocalePreference: null,
        communityDefaultLocale: "invalid" as "en",
        systemFallbackLocale: "en"
      })
    ).toEqual({ locale: "en", source: "system" });
  });
});
