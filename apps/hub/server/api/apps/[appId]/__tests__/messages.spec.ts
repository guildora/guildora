import { describe, expect, it } from "vitest";
import { resolveAppLocaleMessages } from "../../../../utils/app-messages";

describe("resolveAppLocaleMessages", () => {
  it("returns locale-specific messages when available", () => {
    const bundle = {
      "src/i18n/de.json": JSON.stringify({ app: { title: "Titel" } }),
      "src/i18n/en.json": JSON.stringify({ app: { title: "Title" } })
    };

    expect(resolveAppLocaleMessages(bundle, "de")).toEqual({ app: { title: "Titel" } });
  });

  it("falls back to english messages when locale file is missing", () => {
    const bundle = {
      "src/i18n/en.json": JSON.stringify({ app: { title: "Title" } })
    };

    expect(resolveAppLocaleMessages(bundle, "de")).toEqual({ app: { title: "Title" } });
  });

  it("returns an empty object when no app locale files exist", () => {
    expect(resolveAppLocaleMessages({}, "de")).toEqual({});
  });
});
