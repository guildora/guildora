ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_info" text NOT NULL DEFAULT '#1f74ff';
--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_success" text NOT NULL DEFAULT '#2dbe74';
--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_warning" text NOT NULL DEFAULT '#ff9f1a';
--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "color_error" text NOT NULL DEFAULT '#ff4f7d';
--> statement-breakpoint
ALTER TABLE "theme_settings" ALTER COLUMN "color_accent" SET DEFAULT '#ffdd00';
