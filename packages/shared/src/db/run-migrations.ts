import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

/**
 * Runs all Drizzle migrations + idempotent schema fixups.
 * Accepts an explicit migrationsFolder so callers (CLI script, Nitro plugin, …)
 * can each resolve the path that is correct for *their* runtime environment.
 */
export async function runMigrations(connectionString: string, migrationsFolder: string) {
  const ssl =
    process.env.DATABASE_SSL === "false"
      ? false
      : process.env.DATABASE_SSL === "true"
        ? "require"
        : "require";

  const client = postgres(connectionString, { max: 1, ssl });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder });

    // ── Idempotent fixups ──────────────────────────────────────────────

    // Ensure community_settings exists
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

    // Theme settings columns & defaults
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

    // Voice-session hardening
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

    // Apps access setting
    await db.execute(sql`
      ALTER TABLE "cms_access_settings" ADD COLUMN IF NOT EXISTS "allow_moderator_apps_access" boolean NOT NULL DEFAULT true
    `);

    // Users: local avatar + primary Discord role
    await db.execute(sql`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_source" text
    `);
    await db.execute(sql`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "primary_discord_role_name" text
    `);

    // Discord invite code
    await db.execute(sql`
      ALTER TABLE "community_settings" ADD COLUMN IF NOT EXISTS "discord_invite_code" text
    `);

    // App code bundle + KV
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

    // ─── Application Flow System ──────────────────────────────────────

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "application_flow_status" AS ENUM ('draft', 'active', 'inactive');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "application_status" AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "application_flows" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "status" "application_flow_status" NOT NULL DEFAULT 'draft',
        "flow_json" jsonb NOT NULL,
        "settings_json" jsonb NOT NULL,
        "created_by" uuid REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "application_flow_embeds" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "flow_id" uuid NOT NULL REFERENCES "public"."application_flows"("id") ON DELETE cascade ON UPDATE no action,
        "discord_channel_id" text NOT NULL,
        "discord_message_id" text,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "application_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "flow_id" uuid NOT NULL REFERENCES "public"."application_flows"("id") ON DELETE cascade ON UPDATE no action,
        "discord_id" text NOT NULL,
        "discord_username" text NOT NULL,
        "discord_avatar_url" text,
        "token" text NOT NULL UNIQUE,
        "expires_at" timestamp with time zone NOT NULL,
        "used_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "application_tokens_flow_id_idx" ON "application_tokens" ("flow_id")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "application_tokens_discord_id_idx" ON "application_tokens" ("discord_id")
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "flow_id" uuid NOT NULL REFERENCES "public"."application_flows"("id") ON DELETE cascade ON UPDATE no action,
        "discord_id" text NOT NULL,
        "discord_username" text NOT NULL,
        "discord_avatar_url" text,
        "answers_json" jsonb NOT NULL,
        "status" "application_status" NOT NULL DEFAULT 'pending',
        "roles_assigned" jsonb DEFAULT '[]',
        "pending_role_assignments" jsonb DEFAULT '[]',
        "display_name_composed" text,
        "reviewed_by" uuid REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
        "reviewed_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "applications_flow_id_idx" ON "applications" ("flow_id")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "applications_discord_id_idx" ON "applications" ("discord_id")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "applications_status_idx" ON "applications" ("status")
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "application_file_uploads" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "application_id" uuid REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action,
        "discord_id" text NOT NULL,
        "flow_id" uuid NOT NULL REFERENCES "public"."application_flows"("id") ON DELETE cascade ON UPDATE no action,
        "original_filename" text NOT NULL,
        "mime_type" text NOT NULL,
        "storage_path" text NOT NULL,
        "file_size" integer NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "application_file_uploads_application_id_idx" ON "application_file_uploads" ("application_id")
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "application_moderator_notifications" (
        "flow_id" uuid NOT NULL REFERENCES "public"."application_flows"("id") ON DELETE cascade ON UPDATE no action,
        "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
        "enabled" boolean NOT NULL DEFAULT true,
        CONSTRAINT "application_moderator_notifications_flow_id_user_id_pk" PRIMARY KEY("flow_id","user_id")
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "application_access_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "allow_moderator_access" boolean NOT NULL DEFAULT true,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_by" uuid REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
      )
    `);
    await db.execute(sql`
      INSERT INTO "application_access_settings" ("id", "allow_moderator_access", "updated_at") VALUES (1, true, now())
      ON CONFLICT ("id") DO NOTHING
    `);
  } finally {
    await client.end({ timeout: 5 });
  }
}
