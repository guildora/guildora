ALTER TABLE "profiles" DROP COLUMN IF EXISTS "bio";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "selectable_discord_roles" (
  "discord_role_id" text PRIMARY KEY NOT NULL,
  "role_name_snapshot" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_discord_roles" (
  "user_id" uuid NOT NULL,
  "discord_role_id" text NOT NULL,
  "role_name_snapshot" text NOT NULL,
  "synced_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_discord_roles_user_id_discord_role_id_pk" PRIMARY KEY ("user_id","discord_role_id"),
  CONSTRAINT "user_discord_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_discord_roles_discord_role_id_idx" ON "user_discord_roles" USING btree ("discord_role_id");
