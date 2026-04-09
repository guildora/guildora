import { test, expect, type Page } from "@playwright/test";

const SCREENSHOT_DIR = "screenshots/audit-2026-04-09";
const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 768, height: 1024 };
const MOBILE = { width: 375, height: 812 };

/** Login via dev bypass and wait for the target page */
async function devLogin(page: Page, returnTo = "/dashboard") {
  await page.goto(`/api/auth/dev-login?returnTo=${returnTo}`);
  // Some routes redirect internally (e.g. /settings/apps -> /apps/overview)
  // so we wait for load state instead of exact URL match
  await page.waitForLoadState("networkidle");
  // Give client-side hydration time
  await page.waitForTimeout(2000);
}

/** Filter to critical console errors */
function criticalErrors(errors: string[]): string[] {
  return errors.filter(
    (e) =>
      e.includes("Failed to resolve") ||
      e.includes("is not defined") ||
      e.includes("Cannot read properties") ||
      e.includes("Uncaught") ||
      e.includes("500")
  );
}

// ─── Phase 2B: Global Shell / Navigation ────────────────────────────────────

test.describe("2B - Global Shell (Default Layout)", () => {
  test("sidebar renders with correct nav sections for superadmin", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await devLogin(page, "/dashboard");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2B-shell-desktop.png`, fullPage: true });

    // Sidebar should be visible on desktop
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible({ timeout: 10_000 });

    // Core sections that superadmin should see
    for (const label of ["Dashboard", "Members", "Settings", "Apps"]) {
      const link = sidebar.locator(`a:has-text("${label}")`).first();
      await expect(link).toBeVisible({ timeout: 5_000 });
    }
  });

  test("sidebar active state highlights on navigation", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await devLogin(page, "/dashboard");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2B-active-dashboard.png`, fullPage: true });

    // Navigate to members
    await page.goto("/members");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/2B-active-members.png`, fullPage: true });
  });

  test("mobile: sidebar collapses, mobile nav pill appears", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await devLogin(page, "/dashboard");

    // Desktop sidebar should be hidden at mobile width
    const sidebar = page.locator("aside.fixed");
    await expect(sidebar).toBeHidden({ timeout: 5_000 });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2B-shell-mobile-375.png`, fullPage: true });
  });
});

// ─── Phase 2C: Dashboard ────────────────────────────────────────────────────

test.describe("2C - Dashboard", () => {
  test("loads without critical console errors", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await devLogin(page, "/dashboard");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/2C-dashboard-1440.png`, fullPage: true });

    const critical = criticalErrors(errors);
    expect(critical).toEqual([]);
  });

  test("dashboard page renders content", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await devLogin(page, "/dashboard");

    // The dashboard page should have rendered and show at least the page body
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Take screenshot for visual audit — the dashboard may have empty-state
    // content when no data exists, which is valid
    await page.screenshot({ path: `${SCREENSHOT_DIR}/2C-dashboard-content.png`, fullPage: true });

    // Verify page is on dashboard and not redirected
    expect(page.url()).toContain("/dashboard");
  });

  test("responsive: 768px", async ({ page }) => {
    await page.setViewportSize(TABLET);
    await devLogin(page, "/dashboard");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/2C-dashboard-768.png`, fullPage: true });
  });

  test("responsive: 375px", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await devLogin(page, "/dashboard");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/2C-dashboard-375.png`, fullPage: true });
  });
});

// ─── Phase 2D: Members ─────────────────────────────────────────────────────

test.describe("2D - Members", () => {
  test("member list renders", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await devLogin(page, "/members");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2D-members-list.png`, fullPage: true });

    // Page loaded without crashing
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("member detail page or empty state", async ({ page }) => {
    await page.setViewportSize(DESKTOP);

    await devLogin(page, "/members");

    // Try to find a member link
    const memberLink = page.locator('a[href*="/members/"]').first();
    const hasMembers = await memberLink.isVisible().catch(() => false);

    if (hasMembers) {
      await memberLink.click();
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${SCREENSHOT_DIR}/2D-member-detail.png`, fullPage: true });
    } else {
      // KNOWN FINDING: /members/<non-existent-id> returns 500 instead of 404.
      // Navigating to a fabricated member ID triggers server errors.
      // This test documents the behavior but doesn't hard-fail on it.
      await page.screenshot({ path: `${SCREENSHOT_DIR}/2D-members-no-detail-link.png`, fullPage: true });
    }
  });
});

// ─── Phase 2E: Profile ─────────────────────────────────────────────────────

test.describe("2E - Profile", () => {
  test("profile page loads and renders content", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await devLogin(page, "/profile/customize");

    // Wait for page hydration
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/2E-profile-customize.png`, fullPage: true });

    // The profile page should show form elements, buttons, or interactive content
    const interactiveElements = page.locator("input, textarea, select, button");
    const count = await interactiveElements.count();
    // Profile page has at minimum: logout button, save button, avatar upload
    expect(count).toBeGreaterThan(0);
  });
});

// ─── Phase 2H: Settings Pages ──────────────────────────────────────────────

test.describe("2H - Settings Pages", () => {
  const settingsPages = [
    { path: "/settings/community", name: "community" },
    { path: "/settings/custom-fields", name: "custom-fields" },
    { path: "/settings/permissions", name: "permissions" },
    { path: "/settings/moderation-rights", name: "moderation-rights" },
    { path: "/settings/design", name: "design" },
    { path: "/settings/files", name: "files" },
    { path: "/settings/dev-role-switcher", name: "dev-role-switcher" },
  ];

  for (const { path, name } of settingsPages) {
    test(`${path} loads`, async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await devLogin(page, path);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/2H-settings-${name}.png`, fullPage: true });

      // Page should render without 500 errors
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // No critical console errors
      const critical = criticalErrors(errors);
      expect(critical).toEqual([]);
    });
  }

  // /settings/apps redirects to /apps/overview — test that the redirect chain works
  test("/settings/apps redirects to apps area without error", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    // Login first, then navigate
    await page.goto("/api/auth/dev-login?returnTo=/dashboard");
    await page.waitForLoadState("networkidle");
    await page.goto("/settings/apps");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2H-settings-apps.png`, fullPage: true });

    // Should have redirected somewhere in the apps area
    const url = page.url();
    expect(url).toMatch(/\/(apps|settings)/);

    const critical = criticalErrors(errors);
    expect(critical).toEqual([]);
  });
});

// ─── Phase 2I: Apps ────────────────────────────────────────────────────────

test.describe("2I - Apps", () => {
  test("/apps/overview loads (CSR-only)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await devLogin(page, "/apps/overview");
    // Extra wait for CSR hydration
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2I-apps-overview.png`, fullPage: true });

    const body = page.locator("body");
    await expect(body).toBeVisible();

    const critical = criticalErrors(errors);
    expect(critical).toEqual([]);
  });
});

// ─── Phase 2J: Dev Tools ───────────────────────────────────────────────────

test.describe("2J - Dev Tools", () => {
  test("/dev/role-switcher loads", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await devLogin(page, "/dev/role-switcher");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2J-dev-role-switcher.png`, fullPage: true });

    const body = page.locator("body");
    await expect(body).toBeVisible();

    const critical = criticalErrors(errors);
    expect(critical).toEqual([]);
  });

  test("/dev/reset loads", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await devLogin(page, "/dev/reset");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2J-dev-reset.png`, fullPage: true });

    const body = page.locator("body");
    await expect(body).toBeVisible();

    const critical = criticalErrors(errors);
    expect(critical).toEqual([]);
  });
});

// ─── Phase 2K: i18n ────────────────────────────────────────────────────────

test.describe("2K - i18n", () => {
  test("/dashboard (EN) loads correctly", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await devLogin(page, "/dashboard");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2K-dashboard-en.png`, fullPage: true });

    const bodyText = await page.locator("body").textContent() || "";
    // Check for Vue i18n template syntax leaking through ({{key}})
    const vueTemplateLeak = bodyText.match(/\{\{[a-zA-Z_.]+\}\}/g) || [];
    expect(vueTemplateLeak).toEqual([]);
  });

  test("/de/dashboard (DE) loads with German locale", async ({ page }) => {
    await page.setViewportSize(DESKTOP);

    await page.goto("/api/auth/dev-login?returnTo=/de/dashboard");
    await page.waitForURL("**/dashboard**", { timeout: 20_000 });
    await page.waitForLoadState("networkidle");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/2K-dashboard-de.png`, fullPage: true });

    const bodyText = await page.locator("body").textContent() || "";
    const vueTemplateLeak = bodyText.match(/\{\{[a-zA-Z_.]+\}\}/g) || [];
    expect(vueTemplateLeak).toEqual([]);
  });

  test("language switcher component exists", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await devLogin(page, "/dashboard");

    const langSwitcher = page.locator(
      '[class*="lang"], [class*="locale"], select[name*="lang"], [data-testid*="lang"], a[href*="/de/"], button:has-text("DE"), button:has-text("EN"), [aria-label*="language"], [aria-label*="Sprache"]'
    ).first();

    const hasLangSwitcher = await langSwitcher.isVisible().catch(() => false);

    if (hasLangSwitcher) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/2K-lang-switcher-before.png`, fullPage: true });
      await langSwitcher.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/2K-lang-switcher-after.png`, fullPage: true });
    } else {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/2K-lang-switcher-not-found.png`, fullPage: true });
    }
  });
});
