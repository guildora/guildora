ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "logo_data_url" text;
--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "logo_mime_type" text;
--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "logo_file_name" text;
