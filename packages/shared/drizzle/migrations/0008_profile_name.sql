DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "users"
    WHERE trim(coalesce("display_name", '')) = ''
  ) THEN
    RAISE EXCEPTION 'Cannot migrate profile names: users.display_name contains empty values after trim.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "users"
    WHERE position('|' in coalesce("display_name", '')) > 0
       OR position('|' in coalesce("nickname", '')) > 0
  ) THEN
    RAISE EXCEPTION 'Cannot migrate profile names: users.display_name or users.nickname contains "|".';
  END IF;
END $$;
--> statement-breakpoint
UPDATE "users"
SET "display_name" = CASE
  WHEN "nickname" IS NULL OR trim("nickname") = '' THEN trim("display_name")
  ELSE trim("display_name") || ' | ' || trim("nickname")
END;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "nickname";
