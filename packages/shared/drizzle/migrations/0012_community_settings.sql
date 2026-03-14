CREATE TABLE IF NOT EXISTS "community_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "community_name" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
INSERT INTO "community_settings" ("id", "community_name", "updated_at") VALUES (1, NULL, now())
ON CONFLICT ("id") DO NOTHING;
