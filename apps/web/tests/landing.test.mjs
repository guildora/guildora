/**
 * Automated tests for the Guildora landing page (localhost:3000).
 * Run with: node --test apps/web/tests/landing.test.mjs
 *
 * Requires both the web app (port 3000) and the CMS (port 3002) to be running.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const WEB_URL = "http://localhost:3000";
const CMS_URL = "http://localhost:3002";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchHtml(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text };
}

async function fetchJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  return { status: res.status, json };
}

// ---------------------------------------------------------------------------
// CMS API tests
// ---------------------------------------------------------------------------

describe("CMS API – /api/pages", () => {
  test("CMS is reachable", async () => {
    const res = await fetch(`${CMS_URL}/api/pages`);
    assert.equal(res.status, 200, "CMS /api/pages should respond with 200");
  });

  test("landing page exists and is published (EN)", async () => {
    const url = new URL(`${CMS_URL}/api/pages`);
    url.searchParams.set("where[slug][equals]", "landing");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("limit", "1");
    url.searchParams.set("locale", "en");
    url.searchParams.set("fallback-locale", "en");

    const { status, json } = await fetchJson(url.toString());
    assert.equal(status, 200, "CMS should return 200 for landing query");
    assert.equal(json.totalDocs, 1, "Exactly one published landing page should exist");

    const page = json.docs[0];
    assert.equal(page.slug, "landing", "Page slug should be 'landing'");
    assert.equal(page.status, "published", "Page status should be 'published'");
    assert.ok(page.layout?.length > 0, "Landing page should have at least one block in the layout");
    assert.ok(page.seo?.title, "Landing page should have an SEO title");
  });

  test("landing page exists and is published (DE)", async () => {
    const url = new URL(`${CMS_URL}/api/pages`);
    url.searchParams.set("where[slug][equals]", "landing");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("limit", "1");
    url.searchParams.set("locale", "de");
    url.searchParams.set("fallback-locale", "en");

    const { status, json } = await fetchJson(url.toString());
    assert.equal(status, 200, "CMS should return 200 for DE landing query");
    assert.equal(json.totalDocs, 1, "Exactly one published landing page (DE) should exist");

    const page = json.docs[0];
    const heroBlock = page.layout?.find((b) => b.blockType === "hero");
    assert.ok(heroBlock, "DE layout should contain a hero block");
    assert.ok(heroBlock.heading, "DE hero block should have a heading");
  });

  test("landing page layout contains all expected block types", async () => {
    const url = new URL(`${CMS_URL}/api/pages`);
    url.searchParams.set("where[slug][equals]", "landing");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("limit", "1");
    url.searchParams.set("locale", "en");

    const { json } = await fetchJson(url.toString());
    const layout = json.docs[0].layout;
    const blockTypes = layout.map((b) => b.blockType);

    const expected = ["hero", "features", "how-it-works", "marketplace-teaser", "self-host-cta"];
    for (const type of expected) {
      assert.ok(blockTypes.includes(type), `Layout should contain a '${type}' block, got: ${blockTypes.join(", ")}`);
    }
  });

  test("hero block has required fields", async () => {
    const url = new URL(`${CMS_URL}/api/pages`);
    url.searchParams.set("where[slug][equals]", "landing");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("limit", "1");
    url.searchParams.set("locale", "en");

    const { json } = await fetchJson(url.toString());
    const hero = json.docs[0].layout.find((b) => b.blockType === "hero");

    assert.ok(hero.heading, "Hero block should have a heading");
    assert.ok(hero.subheading, "Hero block should have a subheading");
  });

  test("features block has at least one feature entry", async () => {
    const url = new URL(`${CMS_URL}/api/pages`);
    url.searchParams.set("where[slug][equals]", "landing");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("limit", "1");
    url.searchParams.set("locale", "en");

    const { json } = await fetchJson(url.toString());
    const features = json.docs[0].layout.find((b) => b.blockType === "features");

    assert.ok(features, "Features block should be present");
    assert.ok(Array.isArray(features.features) && features.features.length > 0, "Features block should have at least one feature");
    assert.ok(features.features[0].title, "Each feature should have a title");
    assert.ok(features.features[0].description, "Each feature should have a description");
  });
});

// ---------------------------------------------------------------------------
// Web frontend – HTML output
// ---------------------------------------------------------------------------

describe("Landing page – HTML output (SSR)", () => {
  test("/ responds with 200", async () => {
    const { status } = await fetchHtml(WEB_URL);
    assert.equal(status, 200, "Landing page should respond with 200");
  });

  test("HTML contains SEO title from CMS", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      body.includes("Guildora"),
      "Page title should contain 'Guildora'"
    );
  });

  test("HTML does not show fallback text (CMS content loaded)", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      !body.includes("Landing page is not published yet."),
      "Fallback text should NOT appear when CMS content is available"
    );
  });

  test("HTML contains hero block heading", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      body.includes("Your Community, Supercharged"),
      "Hero heading should be rendered in the HTML"
    );
  });

  test("HTML contains features section title", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      body.includes("Everything your community needs"),
      "Features section title should be rendered in the HTML"
    );
  });

  test("HTML contains how-it-works section title", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      body.includes("How it works"),
      "'How it works' section should be rendered in the HTML"
    );
  });

  test("HTML contains marketplace teaser title", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      body.includes("Discover Community Extensions"),
      "Marketplace teaser should be rendered in the HTML"
    );
  });

  test("HTML contains self-host CTA title", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      body.includes("Own Your Community Platform"),
      "Self-host CTA block should be rendered in the HTML"
    );
  });

  test("HTML does not contain unsupported block messages", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      !body.includes("This block type is currently not supported"),
      "No block type should fall through to the unsupported fallback"
    );
  });

  test("HTML does not contain Vue component resolution errors", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      !body.includes("Failed to resolve component"),
      "No Vue component resolution errors should appear in the SSR output"
    );
  });

  test("HTML does not log Vue hydration mismatch warning", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      !body.includes("Hydration completed but contains mismatches"),
      "No hydration mismatches should be present"
    );
  });

  test("HTML contains login button linking to hub", async () => {
    const { body } = await fetchHtml(WEB_URL);
    assert.ok(
      body.includes("localhost:3003/login"),
      "Login button should link to the hub login page"
    );
  });
});

// ---------------------------------------------------------------------------
// CSS / assets
// ---------------------------------------------------------------------------

describe("Static assets", () => {
  test("main.css is served without 404", async () => {
    // Extract the actual CSS href from the page HTML
    const { body } = await fetchHtml(WEB_URL);
    const match = body.match(/href="(\/_nuxt\/[^"]*main\.css[^"]*)"/);
    assert.ok(match, "A <link> tag for main.css should exist in the HTML");

    const cssUrl = `${WEB_URL}${match[1]}`;
    const cssRes = await fetch(cssUrl);
    assert.equal(cssRes.status, 200, `main.css at ${cssUrl} should return 200, got ${cssRes.status}`);
  });

  test("main.css contains Tailwind base or custom CSS variables", async () => {
    const { body: html } = await fetchHtml(WEB_URL);
    const match = html.match(/href="(\/_nuxt\/[^"]*main\.css[^"]*)"/);
    if (!match) return; // guard handled by previous test

    const cssUrl = `${WEB_URL}${match[1]}`;
    const cssRes = await fetch(cssUrl);
    const cssText = await cssRes.text();

    const hasTailwind = cssText.includes("box-sizing") || cssText.includes("--tw-") || cssText.includes("--color-surface");
    assert.ok(hasTailwind, "main.css should contain processed Tailwind/custom CSS");
  });

  test("no CSS link in the HTML returns 404", async () => {
    const { body } = await fetchHtml(WEB_URL);
    const matches = [...body.matchAll(/href="(\/_nuxt\/[^"]*\.css[^"]*)"/g)];
    assert.ok(matches.length > 0, "At least one CSS link should be present");

    const results = await Promise.all(
      matches.map(async ([, path]) => {
        const url = `${WEB_URL}${path}`;
        const res = await fetch(url);
        return { url, status: res.status };
      })
    );

    const broken = results.filter((r) => r.status !== 200);
    assert.equal(
      broken.length,
      0,
      `The following CSS files returned non-200: ${broken.map((r) => `${r.url} (${r.status})`).join(", ")}`
    );
  });
});

// ---------------------------------------------------------------------------
// German locale
// ---------------------------------------------------------------------------

describe("German locale (/de)", () => {
  test("/de responds with 200", async () => {
    const { status } = await fetchHtml(`${WEB_URL}/de`);
    assert.equal(status, 200, "/de should respond with 200");
  });

  test("/de contains German hero heading", async () => {
    const { body } = await fetchHtml(`${WEB_URL}/de`);
    assert.ok(
      body.includes("Deine Community, auf das nächste Level"),
      "German hero heading should appear on /de"
    );
  });
});

// ---------------------------------------------------------------------------
// Server-side locale detection (hydration consistency)
// ---------------------------------------------------------------------------

describe("Server-side locale detection (hydration consistency)", () => {
  test("/ with Accept-Language: de redirects to /de and sets locale cookie", async () => {
    // The localeDetector reads Accept-Language on the server, sets the cookie,
    // and redirects to the correct locale prefix — server and client will both
    // use 'de' on the next request, so no hydration mismatch can occur.
    const res = await fetch(`${WEB_URL}/`, {
      redirect: "manual",
      headers: { "Accept-Language": "de-DE,de;q=0.9,en;q=0.5" }
    });
    assert.equal(res.status, 302, "Server should redirect German users from / to /de");
    const location = res.headers.get("location");
    assert.ok(location?.includes("/de"), `Redirect should target /de, got: ${location}`);

    const setCookie = res.headers.get("set-cookie");
    assert.ok(
      setCookie?.includes("guildora_i18n=de"),
      `Server should set locale cookie to 'de', got: ${setCookie}`
    );
  });

  test("/ with Accept-Language: en renders English content (no redirect)", async () => {
    const { status, body } = await fetchHtml(`${WEB_URL}/`, {
      headers: { "Accept-Language": "en-US,en;q=0.9" }
    });
    assert.equal(status, 200, "English requests to / should get 200, not redirect");
    assert.ok(
      body.includes("Login with Discord"),
      "Server should render English nav text when Accept-Language is en"
    );
  });

  test("/de with locale cookie set renders German content without mismatch", async () => {
    // Simulate a client that was redirected: cookie is set, now visiting /de
    const { status, body } = await fetchHtml(`${WEB_URL}/de`, {
      headers: { cookie: "guildora_i18n=de" }
    });
    assert.equal(status, 200, "/de with de cookie should return 200");
    assert.ok(body.includes("Mit Discord anmelden"), "German nav text should render on /de");
    assert.ok(body.includes("Community-Plattform"), "German footer text should render on /de");
    assert.ok(
      !body.includes("Hydration completed but contains mismatches"),
      "No hydration mismatch warning in /de SSR output"
    );
  });
});
