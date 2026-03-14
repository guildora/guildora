import { eq } from "drizzle-orm";
import { communityRoles, profileChangeLogs, userCommunityRoles } from "@newguildplus/shared";
import { requireModeratorSession } from "../../../../utils/auth";
import { getUserById, getUserRoles, syncPermissionRolesForUser } from "../../../../utils/community";
import {
  buildReviewedApplicationCustomFields,
  ensureProfileByUserId,
  getCommunityApplicationStatus,
  upsertProfileCustomFields
} from "../../../../utils/community-applications";
import { syncDiscordUserFromWebsite } from "../../../../utils/botSync";
import { getDb } from "../../../../utils/db";
import { requireRouterParam } from "../../../../utils/http";

export default defineEventHandler(async (event) => {
  const session = await requireModeratorSession(event);
  const db = getDb();
  const userId = requireRouterParam(event, "id", "Missing user id.");

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
      statusMessage: "Only applicants with Bewerber role can be rejected."
    });
  }

  const profileRow = await ensureProfileByUserId(db, userId);

  const previousStatus = getCommunityApplicationStatus(profileRow.customFields ?? null);
  if (previousStatus === "rejected") {
    throw createError({
      statusCode: 409,
      statusMessage: "Application is already rejected."
    });
  }

  const reviewedAtIso = new Date().toISOString();
  const nextFields = buildReviewedApplicationCustomFields(profileRow.customFields ?? null, "rejected", session.user.id, reviewedAtIso);
  const updatedProfile = await upsertProfileCustomFields(db, userId, nextFields);

  await syncPermissionRolesForUser(userId);

  await db.insert(profileChangeLogs).values({
    profileId: updatedProfile.id,
    changeType: "application_rejected",
    previousValue: previousStatus,
    newValue: "rejected",
    isGrowth: false,
    isDeparture: true,
    changedBy: session.user.id
  });

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
