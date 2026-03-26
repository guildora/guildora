import { eq } from "drizzle-orm";
import { communityRoles, profiles, userCommunityRoles, users } from "@guildora/shared";
import { requireModeratorSession } from "../../../utils/auth";
import { getCommunityApplicationStatus } from "../../../utils/community-applications";
import { getDb } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  await requireModeratorSession(event);
  const db = getDb();

  const rows = await db
    .select({
      userId: users.id,
      discordId: users.discordId,
      profileName: users.displayName,
      communityRole: communityRoles.name,
      customFields: profiles.customFields
    })
    .from(users)
    .innerJoin(userCommunityRoles, eq(userCommunityRoles.userId, users.id))
    .innerJoin(communityRoles, eq(userCommunityRoles.communityRoleId, communityRoles.id))
    .leftJoin(profiles, eq(profiles.userId, users.id));

  return {
    items: rows
      .filter((row) => row.communityRole === "Bewerber")
      .filter((row) => getCommunityApplicationStatus(row.customFields) === "open")
      .map((row) => ({
        userId: row.userId,
        discordId: row.discordId,
        profileName: row.profileName,
        communityRole: row.communityRole,
        applicationStatus: getCommunityApplicationStatus(row.customFields),
        applicationData: row.customFields || {}
      }))
  };
});
