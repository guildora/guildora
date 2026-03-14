import { eq } from "drizzle-orm";
import { communityRoles, userCommunityRoles } from "@newguildplus/shared";
import { z } from "zod";
import { requireModeratorSession } from "../../../../utils/auth";
import { assignCommunityRole, getUserById, getUserRoles } from "../../../../utils/community";
import {
  buildReviewedApplicationCustomFields,
  getCommunityApplicationStatus,
  getProfileByUserId,
  upsertProfileCustomFields
} from "../../../../utils/community-applications";
import { syncDiscordUserFromWebsite } from "../../../../utils/botSync";
import { getDb } from "../../../../utils/db";
import { requireRouterParam } from "../../../../utils/http";

const schema = z.object({
  targetCommunityRoleName: z.string().optional()
});

export default defineEventHandler(async (event) => {
  const session = await requireModeratorSession(event);
  const db = getDb();
  const userId = requireRouterParam(event, "id", "Missing user id.");

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  const targetRoleName = parsed.success && parsed.data.targetCommunityRoleName
    ? parsed.data.targetCommunityRoleName
    : "Anwaerter";
  if (targetRoleName === "Bewerber") {
    throw createError({ statusCode: 400, statusMessage: "Target role must not be Bewerber." });
  }

  const currentRole = await db
    .select({
      communityRole: communityRoles.name
    })
    .from(userCommunityRoles)
    .innerJoin(communityRoles, eq(userCommunityRoles.communityRoleId, communityRoles.id))
    .where(eq(userCommunityRoles.userId, userId))
    .limit(1);
  if (currentRole[0]?.communityRole !== "Bewerber") {
    throw createError({
      statusCode: 409,
      statusMessage: "Only applicants with Bewerber role can be approved."
    });
  }

  const profileRow = await getProfileByUserId(db, userId);
  if (getCommunityApplicationStatus(profileRow?.customFields ?? null) === "rejected") {
    throw createError({
      statusCode: 409,
      statusMessage: "Rejected applications cannot be approved."
    });
  }

  const role = await db.select().from(communityRoles).where(eq(communityRoles.name, targetRoleName)).limit(1);
  if (!role[0]) {
    throw createError({ statusCode: 404, statusMessage: "Target community role not found." });
  }

  await assignCommunityRole(userId, role[0].id, session.user.id);
  const reviewedAtIso = new Date().toISOString();
  const nextFields = buildReviewedApplicationCustomFields(profileRow?.customFields ?? null, "approved", session.user.id, reviewedAtIso);
  await upsertProfileCustomFields(db, userId, nextFields);

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
