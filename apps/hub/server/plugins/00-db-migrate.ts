import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "@guildora/shared/db/run-migrations";

export default defineNitroPlugin(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("[db-migrate] DATABASE_URL not set – skipping auto-migration");
    return;
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // In production (.output/server/plugins/), migrations are at ../../migrations
  // In development, resolve from the shared package
  const migrationsFolder =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "../../migrations")
      : path.resolve(__dirname, "../../../../packages/shared/drizzle/migrations");

  try {
    console.log("[db-migrate] Running database migrations...");
    await runMigrations(connectionString, migrationsFolder);
    console.log("[db-migrate] Migrations applied successfully.");
  } catch (error) {
    console.error("[db-migrate] Migration failed:", error);
    throw error;
  }
});
