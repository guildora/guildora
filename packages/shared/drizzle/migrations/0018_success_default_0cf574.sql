ALTER TABLE "theme_settings" ALTER COLUMN "color_success" SET DEFAULT '#0cf574';

UPDATE "theme_settings"
SET "color_success" = '#0cf574'
WHERE "color_success" = '#5efc8d';
