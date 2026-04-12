import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Auto-load .env files into process.env for preview/production builds
 * where the server is started without --env-file or dotenv.
 *
 * - Runs before all other plugins (filename "00-a-" sorts before "00-db-")
 * - Loads ALL candidate .env files (monorepo root + local), not just the first
 * - Never overrides env vars that are already set (respects Docker environment:)
 * - Silently skips if no .env file is found (expected in Docker production)
 */
export default defineNitroPlugin(() => {
  // Skip if critical env vars are already present (e.g. Docker, --env-file)
  if (process.env.DATABASE_URL && process.env.NUXT_SESSION_PASSWORD) return;

  const candidates = [
    process.env.DOTENV_PATH,
    // Monorepo root .env first (has most vars), then local overrides
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), ".env"),
  ].filter(Boolean) as string[];

  let totalLoaded = 0;

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;

    const content = readFileSync(candidate, "utf-8");
    let loaded = 0;

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      // Strip surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        process.env[key] = value;
        loaded++;
      }
    }

    if (loaded > 0) {
      console.log(`[load-env] Loaded ${loaded} env vars from ${candidate}`);
    }
    totalLoaded += loaded;
  }

  if (totalLoaded === 0) {
    console.log("[load-env] No .env file found (expected in Docker production).");
  }
});
