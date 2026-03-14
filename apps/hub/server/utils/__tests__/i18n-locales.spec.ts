import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function flattenKeys(input: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(input).flatMap(([key, value]) => {
    const current = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, current);
    }
    return [current];
  });
}

describe("i18n locale parity", () => {
  it("keeps de and en keys identical", () => {
    const de = JSON.parse(readFileSync(new URL("../../../i18n/locales/de.json", import.meta.url), "utf8")) as Record<string, unknown>;
    const en = JSON.parse(readFileSync(new URL("../../../i18n/locales/en.json", import.meta.url), "utf8")) as Record<string, unknown>;

    const deKeys = flattenKeys(de).sort();
    const enKeys = flattenKeys(en).sort();

    expect(deKeys).toEqual(enKeys);
  });
});
