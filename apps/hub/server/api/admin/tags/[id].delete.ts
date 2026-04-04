import { eq, sql } from "drizzle-orm";
import { communityTags, profiles } from "@guildora/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { requireRouterParam } from "../../../utils/http";

async function removeTagFromProfiles(db: ReturnType<typeof getDb>, tagName: string) {
  const tagArrayJson = JSON.stringify([tagName]);
  await db.execute(
    sql`UPDATE ${profiles} SET custom_fields = jsonb_set(
      custom_fields,
      '{mod_tags}',
      COALESCE(
        (SELECT jsonb_agg(elem) FROM jsonb_array_elements(custom_fields->'mod_tags') AS elem WHERE elem #>> '{}' != ${tagName}),
        '[]'::jsonb
      )
    ) WHERE custom_fields ? 'mod_tags' AND custom_fields->'mod_tags' @> ${tagArrayJson}::jsonb`
  );
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const id = requireRouterParam(event, "id", "Missing tag id.");

  const db = getDb();

  const [tag] = await db
    .select({ name: communityTags.name })
    .from(communityTags)
    .where(eq(communityTags.id, id))
    .limit(1);

  if (!tag) {
    throw createError({ statusCode: 404, statusMessage: "Tag not found." });
  }

  await removeTagFromProfiles(db, tag.name);

  await db.delete(communityTags).where(eq(communityTags.id, id));

  return { success: true };
});
