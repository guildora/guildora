-- Fix membership_settings columns: replace old condition columns with cleanup_role_configs
-- The schema was updated but the migration file was edited after application

-- Add new column if missing
ALTER TABLE "membership_settings" ADD COLUMN IF NOT EXISTS "cleanup_role_configs" jsonb NOT NULL DEFAULT '[]';

-- Remove old columns that no longer exist in the schema
ALTER TABLE "membership_settings" DROP COLUMN IF EXISTS "auto_cleanup_conditions";
ALTER TABLE "membership_settings" DROP COLUMN IF EXISTS "cleanup_required_role_id";
ALTER TABLE "membership_settings" DROP COLUMN IF EXISTS "cleanup_inactive_days";
ALTER TABLE "membership_settings" DROP COLUMN IF EXISTS "cleanup_no_voice_days";
