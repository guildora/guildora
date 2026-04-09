import crypto from "node:crypto";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "@guildora/shared/db/run-migrations";
import postgres from "postgres";

/**
 * Check if there are pending migrations by comparing the on-disk journal
 * against what the database has already applied.
 */
async function hasPendingMigrations(connectionString: string, migrationsFolder: string): Promise<boolean> {
  const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
  if (!fs.existsSync(journalPath)) return true;

  const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8")) as {
    entries: Array<{ tag: string; when: number }>;
  };

  const ssl =
    process.env.DATABASE_SSL === "false"
      ? false
      : "require";
  const client = postgres(connectionString, { max: 1, ssl });

  try {
    // Check if drizzle journal table exists
    const [{ exists }] = await client`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      )
    `;
    if (!exists) return true;

    const rows = await client`SELECT hash FROM "drizzle"."__drizzle_migrations"`;
    const appliedHashes = new Set(rows.map((r: { hash: string }) => r.hash));

    // Check if any on-disk migration is not yet applied
    for (const entry of journal.entries) {
      const sqlFile = path.join(migrationsFolder, `${entry.tag}.sql`);
      if (!fs.existsSync(sqlFile)) continue;
      const content = fs.readFileSync(sqlFile, "utf-8");
      const hash = crypto.createHash("sha256").update(content).digest("hex");
      if (!appliedHashes.has(hash)) return true;
    }

    return false;
  } catch {
    // If we can't check (e.g. DB unreachable), run migrations to surface the error
    return true;
  } finally {
    await client.end({ timeout: 5 });
  }
}

export default defineNitroPlugin(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("[db-migrate] DATABASE_URL not set – skipping auto-migration");
    return;
  }

  // MIGRATIONS_PATH env allows overriding the migrations folder location.
  // In production the Dockerfile copies migrations to /app/.output/migrations.
  // In development, resolve from the shared package relative to this source file.
  const migrationsFolder =
    process.env.MIGRATIONS_PATH ||
    (process.env.NODE_ENV === "production"
      ? "/app/.output/migrations"
      : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../packages/shared/drizzle/migrations"));

  try {
    const pending = await hasPendingMigrations(connectionString, migrationsFolder);
    if (!pending) {
      console.log("[db-migrate] Database is up to date – skipping migrations.");
    } else {
      console.log("[db-migrate] Pending migrations detected – running...");
      await runMigrations(connectionString, migrationsFolder);
      console.log("[db-migrate] Migrations applied successfully.");
    }
  } catch (error) {
    // Log the error but don't crash the server — the idempotent fixups in
    // runMigrations() cover most schema changes, so the app may still work.
    console.error("[db-migrate] Migration failed (server will continue starting):", error);
  }

  // ── Lightweight idempotent fixups (always run) ──────────────────────
  // These run on every startup and must be safe to repeat.
  const ssl = process.env.DATABASE_SSL === "false" ? false : ("require" as const);
  const fixupClient = postgres(connectionString, { max: 1, ssl });
  try {
    // Remove stale "gaming" template that was inserted by an old migration.
    // The real Gaming template uses id "cyberpunk".
    await fixupClient`
      UPDATE "landing_pages" SET "active_template" = 'cyberpunk'
      WHERE "active_template" = 'gaming'
    `;
    await fixupClient`
      DELETE FROM "landing_templates" WHERE "id" = 'gaming'
    `;
  } catch (error) {
    console.warn("[db-migrate] Post-migration fixup failed (non-fatal):", error);
  } finally {
    await fixupClient.end({ timeout: 5 });
  }
});
