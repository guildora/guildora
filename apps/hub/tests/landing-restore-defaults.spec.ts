import { test, expect } from "@playwright/test";

test.describe("Restore Default Colors button", () => {
  test("settings page loads without server error", async ({ page }) => {
    const response = await page.goto("/landing/settings");
    expect(response?.status()).toBeLessThan(500);
  });

  test("page.put API accepts empty colorOverrides (simulates restore)", async ({ request }) => {
    // Restoring defaults for a template means removing its overrides entry.
    // The save flow sends the full colorOverrides object without the reset template key.
    const response = await request.put("/api/admin/landing/page", {
      data: {
        activeTemplate: "default",
        colorOverrides: {
          // "default" key absent = no overrides for default template (restored)
          cyberpunk: { accent: "#00ff00" },
        },
      },
    });
    expect(response.status()).toBeLessThan(500);
  });

  test("page.put API accepts fully empty colorOverrides after restoring all templates", async ({ request }) => {
    const response = await request.put("/api/admin/landing/page", {
      data: {
        activeTemplate: "cyberpunk",
        colorOverrides: {},
      },
    });
    expect(response.status()).toBeLessThan(500);
  });

  test("public landing API returns valid default colors when no overrides exist", async ({ request }) => {
    const response = await request.get("/api/public/landing?locale=en");
    expect(response.status()).toBeLessThan(500);

    const data = await response.json();
    if (data.colors) {
      // All 7 color keys must be present
      expect(data.colors).toHaveProperty("background");
      expect(data.colors).toHaveProperty("surface");
      expect(data.colors).toHaveProperty("text");
      expect(data.colors).toHaveProperty("textMuted");
      expect(data.colors).toHaveProperty("accent");
      expect(data.colors).toHaveProperty("accentText");
      expect(data.colors).toHaveProperty("border");

      // All values must be valid hex colors
      for (const [, value] of Object.entries(data.colors)) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});
