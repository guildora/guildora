import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./run-migrations";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const migrationsFolder = path.resolve(__dirname, "../../drizzle/migrations");

runMigrations(connectionString, migrationsFolder)
  .then(() => {
    console.log("Migrations applied successfully.");
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
