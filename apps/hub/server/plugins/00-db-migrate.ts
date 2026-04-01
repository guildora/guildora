import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "@guildora/shared/db/run-migrations";

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
    console.log("[db-migrate] Running database migrations...");
    await runMigrations(connectionString, migrationsFolder);
    console.log("[db-migrate] Migrations applied successfully.");
  } catch (error) {
    // Log the error but don't crash the server — the idempotent fixups in
    // runMigrations() cover most schema changes, so the app may still work.
    console.error("[db-migrate] Migration failed (server will continue starting):", error);
  }
});
