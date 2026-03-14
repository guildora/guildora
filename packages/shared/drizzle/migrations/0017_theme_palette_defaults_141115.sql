ALTER TABLE "theme_settings" ALTER COLUMN "color_dominant" SET DEFAULT '#141115';
ALTER TABLE "theme_settings" ALTER COLUMN "color_info" SET DEFAULT '#48beff';
ALTER TABLE "theme_settings" ALTER COLUMN "color_success" SET DEFAULT '#5efc8d';
ALTER TABLE "theme_settings" ALTER COLUMN "color_warning" SET DEFAULT '#f18f01';
ALTER TABLE "theme_settings" ALTER COLUMN "color_error" SET DEFAULT '#bf211e';

ALTER TABLE "theme_settings" ALTER COLUMN "color_info_content_tone" SET DEFAULT 'dark';
ALTER TABLE "theme_settings" ALTER COLUMN "color_success_content_tone" SET DEFAULT 'dark';
ALTER TABLE "theme_settings" ALTER COLUMN "color_warning_content_tone" SET DEFAULT 'light';
ALTER TABLE "theme_settings" ALTER COLUMN "color_error_content_tone" SET DEFAULT 'light';

UPDATE "theme_settings"
SET "color_dominant" = '#141115'
WHERE "color_dominant" IN ('#0c0f0a', '#262322');

UPDATE "theme_settings"
SET "color_info" = '#48beff',
    "color_info_content_tone" = 'dark'
WHERE "color_info" = '#1f74ff';

UPDATE "theme_settings"
SET "color_success" = '#5efc8d',
    "color_success_content_tone" = 'dark'
WHERE "color_success" = '#2dbe74';

UPDATE "theme_settings"
SET "color_warning" = '#f18f01',
    "color_warning_content_tone" = 'light'
WHERE "color_warning" = '#ff9f1a';

UPDATE "theme_settings"
SET "color_error" = '#bf211e',
    "color_error_content_tone" = 'light'
WHERE "color_error" IN ('#ff4f7d', '#bf211e')
  AND "color_error_content_tone" = 'dark';
