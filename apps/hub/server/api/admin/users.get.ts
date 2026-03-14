import { users } from "@newguildplus/shared";
import { requireAdminSession } from "../../utils/auth";
import { getDb } from "../../utils/db";
import { loadUserCommunityRolesMap, loadUserPermissionRolesMap } from "../../utils/user-directory";

export default defineEventHandler(async (event) => {
  const db = getDb();
  await requireAdminSession(event);

  const [userRows, permissionMap, communityMap] = await Promise.all([
    db.select().from(users),
    loadUserPermissionRolesMap(db),
    loadUserCommunityRolesMap(db)
  ]);

  return userRows.map((user) => ({
    id: user.id,
    discordId: user.discordId,
    profileName: user.displayName,
    avatarUrl: user.avatarUrl,
    permissionRoles: permissionMap.get(user.id) || [],
    communityRole: communityMap.get(user.id)?.name ?? null
  }));
});
