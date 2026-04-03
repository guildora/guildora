-- Add enabled_locales column to landing_pages for multi-language support
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "enabled_locales" jsonb NOT NULL DEFAULT '["en"]'::jsonb;
