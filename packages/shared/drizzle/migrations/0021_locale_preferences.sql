ALTER TABLE "community_settings"
ADD COLUMN IF NOT EXISTS "default_locale" text NOT NULL DEFAULT 'en';
--> statement-breakpoint
ALTER TABLE "profiles"
ADD COLUMN IF NOT EXISTS "locale_preference" text;
--> statement-breakpoint
UPDATE "profiles"
SET "locale_preference" = lower("custom_fields"->>'localePreference')
WHERE "locale_preference" IS NULL
  AND lower("custom_fields"->>'localePreference') IN ('en', 'de');
--> statement-breakpoint
UPDATE "community_settings"
SET "default_locale" = 'en'
WHERE "default_locale" IS NULL
   OR "default_locale" NOT IN ('en', 'de');
