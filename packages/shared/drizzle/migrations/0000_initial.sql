CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "absence_status" AS ENUM ('away', 'maintenance');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "discord_id" text NOT NULL,
  "email" text,
  "display_name" text NOT NULL,
  "avatar_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);

CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "bio" text,
  "absence_status" "absence_status",
  "absence_message" text,
  "custom_fields" jsonb DEFAULT '{}'::jsonb,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE "roles" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  CONSTRAINT "roles_name_unique" UNIQUE("name")
);

CREATE TABLE "user_roles" (
  "user_id" uuid NOT NULL,
  "role_id" integer NOT NULL,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id", "role_id")
);

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE cascade;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE cascade;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_role_id_roles_id_fk"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id")
  ON DELETE cascade;
