import { defineConfig } from "drizzle-kit";

// DATABASE_URL wird von db:generate-Script geladen (dotenv -e ../../.env)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for Drizzle config.");
}

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString
  },
  strict: true,
  verbose: true
});
