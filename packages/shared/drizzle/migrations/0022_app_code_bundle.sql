ALTER TABLE "installed_apps" ADD COLUMN IF NOT EXISTS "code_bundle" jsonb DEFAULT '{}' NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_kv" (
  "app_id" text NOT NULL,
  "key" text NOT NULL,
  "value" jsonb,
  CONSTRAINT "app_kv_app_id_key_pk" PRIMARY KEY("app_id","key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "app_kv_app_id_idx" ON "app_kv" ("app_id");
