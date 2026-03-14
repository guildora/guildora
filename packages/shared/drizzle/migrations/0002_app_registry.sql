DO $$ BEGIN
 CREATE TYPE "public"."app_install_status" AS ENUM('active', 'inactive', 'error');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."app_install_source" AS ENUM('marketplace', 'sideloaded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "installed_apps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "app_id" text NOT NULL,
  "name" text NOT NULL,
  "version" text NOT NULL,
  "status" "app_install_status" DEFAULT 'inactive' NOT NULL,
  "source" "app_install_source" DEFAULT 'sideloaded' NOT NULL,
  "verified" boolean DEFAULT false NOT NULL,
  "repository_url" text,
  "manifest" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_by" uuid,
  "installed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "installed_apps_app_id_unique" UNIQUE("app_id")
);
--> statement-breakpoint
ALTER TABLE "installed_apps" DROP CONSTRAINT IF EXISTS "installed_apps_created_by_users_id_fk";
ALTER TABLE "installed_apps" ADD CONSTRAINT "installed_apps_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
