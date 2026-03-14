ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nickname" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "absence_until" timestamp with time zone;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permission_roles" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "level" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "permission_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_roles" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "permission_role_id" integer NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "community_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_permission_roles" (
  "user_id" uuid NOT NULL,
  "permission_role_id" integer NOT NULL,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_permission_roles_user_id_permission_role_id_pk" PRIMARY KEY("user_id","permission_role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_community_roles" (
  "user_id" uuid NOT NULL,
  "community_role_id" integer NOT NULL,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_community_roles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voice_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "channel_id" text,
  "started_at" timestamp with time zone NOT NULL,
  "ended_at" timestamp with time zone,
  "duration_minutes" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_change_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "change_type" text NOT NULL,
  "previous_value" text,
  "new_value" text,
  "is_growth" boolean DEFAULT false NOT NULL,
  "is_departure" boolean DEFAULT false NOT NULL,
  "changed_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_roles" DROP CONSTRAINT IF EXISTS "community_roles_permission_role_id_permission_roles_id_fk";
ALTER TABLE "community_roles" ADD CONSTRAINT "community_roles_permission_role_id_permission_roles_id_fk" FOREIGN KEY ("permission_role_id") REFERENCES "public"."permission_roles"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_permission_roles" DROP CONSTRAINT IF EXISTS "user_permission_roles_user_id_users_id_fk";
ALTER TABLE "user_permission_roles" ADD CONSTRAINT "user_permission_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_permission_roles" DROP CONSTRAINT IF EXISTS "user_permission_roles_permission_role_id_permission_roles_id_fk";
ALTER TABLE "user_permission_roles" ADD CONSTRAINT "user_permission_roles_permission_role_id_permission_roles_id_fk" FOREIGN KEY ("permission_role_id") REFERENCES "public"."permission_roles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_community_roles" DROP CONSTRAINT IF EXISTS "user_community_roles_user_id_users_id_fk";
ALTER TABLE "user_community_roles" ADD CONSTRAINT "user_community_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_community_roles" DROP CONSTRAINT IF EXISTS "user_community_roles_community_role_id_community_roles_id_fk";
ALTER TABLE "user_community_roles" ADD CONSTRAINT "user_community_roles_community_role_id_community_roles_id_fk" FOREIGN KEY ("community_role_id") REFERENCES "public"."community_roles"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "voice_sessions" DROP CONSTRAINT IF EXISTS "voice_sessions_user_id_users_id_fk";
ALTER TABLE "voice_sessions" ADD CONSTRAINT "voice_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profile_change_log" DROP CONSTRAINT IF EXISTS "profile_change_log_profile_id_profiles_id_fk";
ALTER TABLE "profile_change_log" ADD CONSTRAINT "profile_change_log_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profile_change_log" DROP CONSTRAINT IF EXISTS "profile_change_log_changed_by_users_id_fk";
ALTER TABLE "profile_change_log" ADD CONSTRAINT "profile_change_log_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "permission_roles" ("name", "description", "level")
VALUES
  ('temporaer', 'Temporary applicant permissions.', 0),
  ('user', 'Default community user role.', 10),
  ('moderator', 'Can moderate community content.', 50),
  ('admin', 'Full administrative permissions.', 80),
  ('superadmin', 'System owner with full access.', 100)
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "user_permission_roles" ("user_id", "permission_role_id", "assigned_at")
SELECT ur.user_id, pr.id, ur.assigned_at
FROM "user_roles" ur
INNER JOIN "roles" r ON r.id = ur.role_id
INNER JOIN "permission_roles" pr ON pr.name = r.name
ON CONFLICT ("user_id", "permission_role_id") DO NOTHING;
--> statement-breakpoint
DROP TABLE IF EXISTS "user_roles";
--> statement-breakpoint
DROP TABLE IF EXISTS "roles";