CREATE TABLE "theme_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"color_dominant" text DEFAULT '#0c0f0a' NOT NULL,
	"color_secondary" text DEFAULT '#ffffff' NOT NULL,
	"color_accent" text DEFAULT '#ff206e' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;