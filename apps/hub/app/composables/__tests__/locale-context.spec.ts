import { describe, expect, it } from "vitest";
import { isLandingContentPath } from "../useLocaleContext";

describe("isLandingContentPath", () => {
  it("always returns false in hub because landing runs in web", () => {
    expect(isLandingContentPath("/")).toBe(false);
    expect(isLandingContentPath("/de")).toBe(false);
    expect(isLandingContentPath("/en")).toBe(false);
  });

  it("does not match non-landing routes", () => {
    expect(isLandingContentPath("/dashboard")).toBe(false);
    expect(isLandingContentPath("/de/dashboard")).toBe(false);
    expect(isLandingContentPath("/members")).toBe(false);
  });
});
