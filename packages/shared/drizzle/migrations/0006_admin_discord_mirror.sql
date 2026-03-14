ALTER TABLE "community_roles"
  ADD COLUMN IF NOT EXISTS "discord_role_id" text;
--> statement-breakpoint
ALTER TABLE "community_roles"
  ADD CONSTRAINT "community_roles_discord_role_id_unique" UNIQUE("discord_role_id");
