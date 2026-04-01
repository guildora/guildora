CREATE TABLE "role_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "role_groups_name_unique" UNIQUE("name")
);--> statement-breakpoint
CREATE TABLE "role_picker_embeds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "group_id" uuid NOT NULL,
  "discord_channel_id" text NOT NULL,
  "discord_message_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "role_picker_embeds_group_id_unique" UNIQUE("group_id")
);--> statement-breakpoint
ALTER TABLE "selectable_discord_roles" ADD COLUMN "group_id" uuid;--> statement-breakpoint
ALTER TABLE "selectable_discord_roles" ADD COLUMN "emoji" text;--> statement-breakpoint
ALTER TABLE "selectable_discord_roles" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "role_picker_embeds" ADD CONSTRAINT "role_picker_embeds_group_id_role_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."role_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selectable_discord_roles" ADD CONSTRAINT "selectable_discord_roles_group_id_role_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."role_groups"("id") ON DELETE set null ON UPDATE no action;