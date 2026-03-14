import { eq, inArray } from "drizzle-orm";
import {
  communityRoles,
  permissionRoles,
  profiles,
  userCommunityRoles,
  userPermissionRoles
} from "@newguildplus/shared";
import type { getDb } from "./db";

type DbClient = ReturnType<typeof getDb>;

export type UserCommunityRoleEntry = {
  id: number;
  name: string;
};

export type UserProfileEntry = typeof profiles.$inferSelect;

export async function loadUserPermissionRolesMap(db: DbClient, userIds?: string[]): Promise<Map<string, string[]>> {
  if (userIds && userIds.length === 0) {
    return new Map();
  }

  const baseQuery = db
    .select({
      userId: userPermissionRoles.userId,
      permissionRole: permissionRoles.name
    })
    .from(userPermissionRoles)
    .innerJoin(permissionRoles, eq(permissionRoles.id, userPermissionRoles.permissionRoleId));
  const rows = userIds ? await baseQuery.where(inArray(userPermissionRoles.userId, userIds)) : await baseQuery;

  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.userId) || [];
    list.push(row.permissionRole);
    map.set(row.userId, list);
  }
  return map;
}

export async function loadUserCommunityRolesMap(db: DbClient, userIds?: string[]): Promise<Map<string, UserCommunityRoleEntry>> {
  if (userIds && userIds.length === 0) {
    return new Map();
  }

  const baseQuery = db
    .select({
      userId: userCommunityRoles.userId,
      communityRoleId: communityRoles.id,
      communityRoleName: communityRoles.name
    })
    .from(userCommunityRoles)
    .innerJoin(communityRoles, eq(communityRoles.id, userCommunityRoles.communityRoleId));
  const rows = userIds ? await baseQuery.where(inArray(userCommunityRoles.userId, userIds)) : await baseQuery;

  const map = new Map<string, UserCommunityRoleEntry>();
  for (const row of rows) {
    map.set(row.userId, {
      id: row.communityRoleId,
      name: row.communityRoleName
    });
  }
  return map;
}

export async function loadUserProfilesMap(db: DbClient, userIds?: string[]): Promise<Map<string, UserProfileEntry>> {
  if (userIds && userIds.length === 0) {
    return new Map();
  }

  const baseQuery = db.select().from(profiles);
  const rows = userIds ? await baseQuery.where(inArray(profiles.userId, userIds)) : await baseQuery;
  return new Map(rows.map((profile) => [profile.userId, profile]));
}
