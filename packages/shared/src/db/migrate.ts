import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  const ssl =
    process.env.DATABASE_SSL === "false"
      ? false
      : process.env.DATABASE_SSL === "true"
        ? "require"
        : "require";

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  const client = postgres(connectionString, { max: 1, ssl });
  const db = drizzle(client);

  const migrationsFolder = path.resolve(__dirname, "../../drizzle/migrations");
  await migrate(db, { migrationsFolder });

  // Ensure community_settings exists (idempotent); handles DB where 0012 was skipped or table was dropped
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "community_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "community_name" text,
      "default_locale" text NOT NULL DEFAULT 'en',
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_by" uuid REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
    )
  `);
  await db.execute(sql`
    ALTER TABLE "community_settings" ADD COLUMN IF NOT EXISTS "default_locale" text NOT NULL DEFAULT 'en'
  `);
  await db.execute(sql`
    INSERT INTO "community_settings" ("id", "community_name", "default_locale", "updated_at") VALUES (1, NULL, 'en', now())
    ON CONFLICT ("id") DO NOTHING
  `);
  await db.execute(sql`
    UPDATE "community_settings"
    SET "default_locale" = 'en'
    WHERE "default_locale" IS NULL
      OR "default_locale" NOT IN ('en', 'de')
  `);
  await db.execute(sql`
    ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "locale_preference" text
  `);
  await db.execute(sql`
    UPDATE "profiles"
    SET "locale_preference" = lower("custom_fields"->>'localePreference')
    WHERE "locale_preference" IS NULL
      AND lower("custom_fields"->>'localePreference') IN ('en', 'de')
  `);

  // Idempotent: ensure sidebar_logo_size_px exists (handles migration 0013 skipped or different DB)
  await db.execute(sql`
    ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "sidebar_logo_size_px" integer DEFAULT 60
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_accent_content_tone" text NOT NULL DEFAULT 'light'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_info_content_tone" text NOT NULL DEFAULT 'light'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_success_content_tone" text NOT NULL DEFAULT 'dark'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_warning_content_tone" text NOT NULL DEFAULT 'dark'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_error_content_tone" text NOT NULL DEFAULT 'dark'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_dominant" SET DEFAULT '#141115'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_info" SET DEFAULT '#48beff'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_success" SET DEFAULT '#0cf574'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_warning" SET DEFAULT '#f18f01'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_error" SET DEFAULT '#bf211e'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_accent_content_tone" SET DEFAULT 'light'
  `);
  await db.execute(sql`
    UPDATE "theme_settings"
    SET "color_accent_content_tone" = 'light'
    WHERE "color_accent" = '#ff206e'
      AND "color_accent_content_tone" = 'dark'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_info_content_tone" SET DEFAULT 'dark'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_warning_content_tone" SET DEFAULT 'light'
  `);
  await db.execute(sql`
    ALTER TABLE "theme_settings" ALTER COLUMN "color_error_content_tone" SET DEFAULT 'light'
  `);

  // Voice-session hardening:
  // 1) close duplicate open sessions conservatively (zero minutes)
  // 2) enforce max one open session per user
  // 3) add partial index for open-session scans
  await db.execute(sql`
    WITH ranked_open_sessions AS (
      SELECT
        id,
        row_number() OVER (
          PARTITION BY user_id
          ORDER BY started_at DESC, created_at DESC, id DESC
        ) AS rn
      FROM "voice_sessions"
      WHERE ended_at IS NULL
    )
    UPDATE "voice_sessions" AS session
    SET
      ended_at = session.started_at,
      duration_minutes = 0
    FROM ranked_open_sessions
    WHERE session.id = ranked_open_sessions.id
      AND ranked_open_sessions.rn > 1
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "voice_sessions_open_started_idx"
    ON "voice_sessions" ("started_at" DESC)
    WHERE "ended_at" IS NULL
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "voice_sessions_one_open_per_user_idx"
    ON "voice_sessions" ("user_id")
    WHERE "ended_at" IS NULL
  `);

  // 0023: Discord invite code in community settings
  await db.execute(sql`
    ALTER TABLE "community_settings" ADD COLUMN IF NOT EXISTS "discord_invite_code" text
  `);

  // 0022: App code bundle column + app_kv table
  await db.execute(sql`
    ALTER TABLE "installed_apps" ADD COLUMN IF NOT EXISTS "code_bundle" jsonb DEFAULT '{}' NOT NULL
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "app_kv" (
      "app_id" text NOT NULL,
      "key" text NOT NULL,
      "value" jsonb,
      CONSTRAINT "app_kv_app_id_key_pk" PRIMARY KEY("app_id","key")
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "app_kv_app_id_idx" ON "app_kv" ("app_id")
  `);

  await client.end({ timeout: 5 });
}

run()
  .then(() => {
    console.log("Migrations applied successfully.");
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
