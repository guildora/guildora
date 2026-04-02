-- Rename cms_access_settings → moderation_settings
ALTER TABLE IF EXISTS "cms_access_settings" RENAME TO "moderation_settings";

-- Landing templates
CREATE TABLE IF NOT EXISTS "landing_templates" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "preview_url" text,
  "is_builtin" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Landing pages (one row per locale, singleton-like)
CREATE TABLE IF NOT EXISTS "landing_pages" (
  "id" serial PRIMARY KEY NOT NULL,
  "active_template" text NOT NULL DEFAULT 'default' REFERENCES "landing_templates"("id") ON DELETE SET DEFAULT,
  "custom_css" text,
  "locale" text NOT NULL DEFAULT 'en',
  "meta_title" text,
  "meta_description" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Landing sections (content blocks)
CREATE TABLE IF NOT EXISTS "landing_sections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "block_type" text NOT NULL,
  "sort_order" integer NOT NULL,
  "visible" boolean NOT NULL DEFAULT true,
  "config" jsonb NOT NULL DEFAULT '{}',
  "content" jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);
