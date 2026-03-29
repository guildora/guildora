-- Add last_login_at to users
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamptz;

-- Membership settings (singleton, id=1)
CREATE TABLE IF NOT EXISTS "membership_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "applications_required" boolean NOT NULL DEFAULT true,
  "default_community_role_id" integer REFERENCES "community_roles"("id") ON DELETE SET NULL,
  "required_login_role_id" text,
  "auto_sync_enabled" boolean NOT NULL DEFAULT false,
  "auto_sync_interval_hours" integer NOT NULL DEFAULT 24,
  "auto_sync_last_run" timestamptz,
  "auto_cleanup_enabled" boolean NOT NULL DEFAULT false,
  "auto_cleanup_interval_hours" integer NOT NULL DEFAULT 24,
  "auto_cleanup_last_run" timestamptz,
  "cleanup_role_configs" jsonb NOT NULL DEFAULT '[]',
  "cleanup_role_whitelist" jsonb NOT NULL DEFAULT '[]',
  "cleanup_protect_moderators" boolean NOT NULL DEFAULT true,
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Seed singleton row
INSERT INTO "membership_settings" ("id") VALUES (1) ON CONFLICT DO NOTHING;

-- Cleanup log
CREATE TABLE IF NOT EXISTS "cleanup_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "discord_id" text NOT NULL,
  "discord_username" text NOT NULL,
  "reason" text NOT NULL,
  "conditions_matched" jsonb NOT NULL DEFAULT '[]',
  "roles_removed" jsonb NOT NULL DEFAULT '[]',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cleanup_log_created_at_idx" ON "cleanup_log" ("created_at" DESC);
