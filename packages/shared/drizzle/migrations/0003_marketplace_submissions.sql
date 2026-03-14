DO $$ BEGIN
 CREATE TYPE "public"."app_submission_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_marketplace_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "app_id" text NOT NULL,
  "name" text NOT NULL,
  "version" text NOT NULL,
  "source_url" text,
  "manifest" jsonb NOT NULL,
  "status" "app_submission_status" DEFAULT 'pending' NOT NULL,
  "automated_checks" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "review_notes" text,
  "submitted_by_user_id" uuid,
  "reviewed_by_user_id" uuid,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_marketplace_submissions" DROP CONSTRAINT IF EXISTS "app_marketplace_submissions_submitted_by_user_id_users_id_fk";
ALTER TABLE "app_marketplace_submissions" ADD CONSTRAINT "app_marketplace_submissions_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "app_marketplace_submissions" DROP CONSTRAINT IF EXISTS "app_marketplace_submissions_reviewed_by_user_id_users_id_fk";
ALTER TABLE "app_marketplace_submissions" ADD CONSTRAINT "app_marketplace_submissions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
