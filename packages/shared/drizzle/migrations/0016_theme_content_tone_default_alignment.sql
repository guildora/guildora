ALTER TABLE "theme_settings" ALTER COLUMN "color_accent_content_tone" SET DEFAULT 'dark';
ALTER TABLE "theme_settings" ALTER COLUMN "color_info_content_tone" SET DEFAULT 'light';
ALTER TABLE "theme_settings" ALTER COLUMN "color_success_content_tone" SET DEFAULT 'dark';
ALTER TABLE "theme_settings" ALTER COLUMN "color_warning_content_tone" SET DEFAULT 'dark';
ALTER TABLE "theme_settings" ALTER COLUMN "color_error_content_tone" SET DEFAULT 'dark';

UPDATE "theme_settings"
SET "color_accent_content_tone" = 'dark'
WHERE "color_accent_content_tone" = 'light'
  AND "color_accent" = '#ff206e';

UPDATE "theme_settings"
SET "color_success_content_tone" = 'dark'
WHERE "color_success_content_tone" = 'light'
  AND "color_success" = '#2dbe74';

UPDATE "theme_settings"
SET "color_error_content_tone" = 'dark'
WHERE "color_error_content_tone" = 'light'
  AND "color_error" = '#ff4f7d';
