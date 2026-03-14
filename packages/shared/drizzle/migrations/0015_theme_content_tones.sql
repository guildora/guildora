ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_accent_content_tone" text NOT NULL DEFAULT 'light';
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_info_content_tone" text NOT NULL DEFAULT 'light';
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_success_content_tone" text NOT NULL DEFAULT 'light';
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_warning_content_tone" text NOT NULL DEFAULT 'dark';
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_error_content_tone" text NOT NULL DEFAULT 'light';
