CREATE TYPE "editor_mode" AS ENUM ('simple', 'advanced');

ALTER TABLE "application_flows" ADD COLUMN "editor_mode" "editor_mode" NOT NULL DEFAULT 'simple';

-- Backfill: all existing flows were created in Advanced Mode
UPDATE "application_flows" SET "editor_mode" = 'advanced';
