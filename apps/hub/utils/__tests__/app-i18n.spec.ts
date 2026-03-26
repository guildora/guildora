import { describe, expect, it, vi } from "vitest";
import { createAppFirstTranslator, normalizeAppMessages } from "../../app/utils/app-i18n";

describe("app page i18n helpers", () => {
  it("uses app translation when the key exists in app messages", () => {
    const globalT = vi.fn(() => "global");
    const appT = vi.fn(() => "app");
    const appTe = vi.fn((key: string) => key === "app.title");

    const t = createAppFirstTranslator({ appT, appTe, globalT });
    const result = t("app.title");

    expect(result).toBe("app");
    expect(appT).toHaveBeenCalledOnce();
    expect(globalT).not.toHaveBeenCalled();
  });

  it("falls back to global translation when app message is missing", () => {
    const globalT = vi.fn(() => "global");
    const appT = vi.fn(() => "app");
    const appTe = vi.fn(() => false);

    const t = createAppFirstTranslator({ appT, appTe, globalT });
    const result = t("nav.dashboard");

    expect(result).toBe("global");
    expect(globalT).toHaveBeenCalledOnce();
    expect(appT).not.toHaveBeenCalled();
  });

  it("normalizes unknown message payloads to an empty object", () => {
    expect(normalizeAppMessages(null)).toEqual({});
    expect(normalizeAppMessages("invalid")).toEqual({});
    expect(normalizeAppMessages({ app: { title: "ok" } })).toEqual({ app: { title: "ok" } });
  });
});
