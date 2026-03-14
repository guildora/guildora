import { eq } from "drizzle-orm";
import { communityRoles } from "@newguildplus/shared";
import { z } from "zod";
import { requireModeratorSession } from "../../../../utils/auth";
import { assignCommunityRole, getUserById, getUserRoles } from "../../../../utils/community";
import { buildOpenedApplicationCustomFields, getProfileByUserId, upsertProfileCustomFields } from "../../../../utils/community-applications";
import { syncDiscordUserFromWebsite } from "../../../../utils/botSync";
import { getDb } from "../../../../utils/db";
import { readBodyWithSchema, requireRouterParam } from "../../../../utils/http";

const schema = z.object({
  communityRoleId: z.number().int().positive()
});

export default defineEventHandler(async (event) => {
  const session = await requireModeratorSession(event);
  const db = getDb();
  const userId = requireRouterParam(event, "id", "Missing user id.");
  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.");

  await assignCommunityRole(userId, parsed.communityRoleId, session.user.id);

  const roleRow = await db.select().from(communityRoles).where(eq(communityRoles.id, parsed.communityRoleId)).limit(1);
  if (roleRow[0]?.name === "Bewerber") {
    const profileRow = await getProfileByUserId(db, userId);
    const nextFields = buildOpenedApplicationCustomFields(profileRow?.customFields ?? null, new Date().toISOString());
    await upsertProfileCustomFields(db, userId, nextFields);
  }

  const [user, permissionRoles] = await Promise.all([getUserById(userId), getUserRoles(userId)]);
  if (user) {
    await syncDiscordUserFromWebsite({
      discordId: user.discordId,
      profileName: user.displayName,
      permissionRoles
    });
  }

  return { ok: true };
});
