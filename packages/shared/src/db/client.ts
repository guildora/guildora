import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type NewGuildPlusDatabase = ReturnType<typeof createDb>;

export function createDb(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const ssl =
    process.env.DATABASE_SSL === "false"
      ? false
      : process.env.DATABASE_SSL === "true"
        ? "require"
        : "require";

  const client = postgres(connectionString, {
    max: 10,
    ssl
  });

  return drizzle(client, { schema });
}
