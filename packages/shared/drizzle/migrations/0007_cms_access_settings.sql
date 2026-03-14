CREATE TABLE IF NOT EXISTS "cms_access_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "allow_moderator_access" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "cms_access_settings"
  ADD CONSTRAINT "cms_access_settings_updated_by_users_id_fk"
  FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
  ON DELETE set null
  ON UPDATE no action;
