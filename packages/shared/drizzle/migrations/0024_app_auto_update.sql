ALTER TABLE "installed_apps" ADD COLUMN IF NOT EXISTS "auto_update" boolean NOT NULL DEFAULT false;
