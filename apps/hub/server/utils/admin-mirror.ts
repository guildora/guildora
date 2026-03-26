import { and, eq, inArray, notInArray } from "drizzle-orm";
import {
  coerceProfileNameFromRaw,
  communityRoles,
  permissionRoles,
  profiles,
  userCommunityRoles,
  userPermissionRoles,
  users
} from "@guildora/shared";
import type { DiscordGuildMember, DiscordGuildRole } from "./botSync";
import { ensureCommunityUser, ensureUserProfile, type ActiveCommunityRoleMapping, upsertCommunityRoleAssignment } from "./community";
import { getDb } from "./db";
import { replaceUserDiscordRolesSnapshotFromMember } from "./discord-roles";
import { loadUserCommunityRolesMap, loadUserPermissionRolesMap } from "./user-directory";

export function collectMappedRolesForMember(discordRoleIds: string[], mappings: ActiveCommunityRoleMapping[]) {
  const roleIdSet = new Set(discordRoleIds);
  return mappings.filter((mapping) => roleIdSet.has(mapping.discordRoleId));
}

export async function upsertMirroredDiscordMember(
  member: DiscordGuildMember,
  mappedCommunityRoleId: number,
  superadminDiscordId?: string | null,
  guildRoles: DiscordGuildRole[] = []
) {
  const importedName = member.nickname || member.displayName;
  const profileName = coerceProfileNameFromRaw(importedName, `discord-${member.discordId}`);

  const user = await ensureCommunityUser({
    discordId: member.discordId,
    profileName,
    avatarUrl: member.avatarUrl,
    email: null,
    superadminDiscordId
  });
  const profileCreated = await ensureUserProfile(user.id);
  await upsertCommunityRoleAssignment(user.id, mappedCommunityRoleId);
  await replaceUserDiscordRolesSnapshotFromMember(user.id, member, guildRoles);
  return {
    userId: user.id,
    discordId: user.discordId,
    profileName: user.displayName,
    profileCreated
  };
}

export async function wasUserExistingByDiscordId(discordId: string) {
  const db = getDb();
  const row = await db.select({ id: users.id }).from(users).where(eq(users.discordId, discordId)).limit(1);
  return Boolean(row[0]);
}

export async function listSuperadminUserIds() {
  const db = getDb();
  const rows = await db
    .select({ userId: userPermissionRoles.userId })
    .from(userPermissionRoles)
    .innerJoin(permissionRoles, eq(userPermissionRoles.permissionRoleId, permissionRoles.id))
    .where(eq(permissionRoles.name, "superadmin"));
  return new Set(rows.map((row) => row.userId));
}

export async function isSuperadminUser(userId: string) {
  const db = getDb();
  const rows = await db
    .select({ userId: userPermissionRoles.userId })
    .from(userPermissionRoles)
    .innerJoin(permissionRoles, eq(userPermissionRoles.permissionRoleId, permissionRoles.id))
    .where(and(eq(userPermissionRoles.userId, userId), eq(permissionRoles.name, "superadmin")))
    .limit(1);
  return Boolean(rows[0]);
}

export async function listOrphanedCandidates(validDiscordIds: string[]) {
  const db = getDb();
  const superadminIds = await listSuperadminUserIds();

  const userRows = validDiscordIds.length > 0
    ? await db.select().from(users).where(notInArray(users.discordId, validDiscordIds))
    : await db.select().from(users);

  const filteredUsers = userRows.filter((user) => !superadminIds.has(user.id));
  if (filteredUsers.length === 0) {
    return [];
  }

  const userIds = filteredUsers.map((user) => user.id);
  const [communityByUser, permissionByUser] = await Promise.all([
    loadUserCommunityRolesMap(db, userIds),
    loadUserPermissionRolesMap(db, userIds)
  ]);

  return filteredUsers.map((user) => ({
    userId: user.id,
    discordId: user.discordId,
    profileName: user.displayName,
    communityRole: communityByUser.get(user.id)?.name ?? null,
    permissionRoles: permissionByUser.get(user.id) || []
  }));
}

export async function deleteUsersByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return 0;
  }
  const db = getDb();
  const deleted = await db.delete(users).where(inArray(users.id, userIds)).returning({ id: users.id });
  return deleted.length;
}

export async function loadCommunityRoleById(roleId: number) {
  const db = getDb();
  const rows = await db.select().from(communityRoles).where(eq(communityRoles.id, roleId)).limit(1);
  return rows[0] ?? null;
}

export async function listUsersByCommunityRoleId(communityRoleId: number) {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      discordId: users.discordId,
      profileName: users.displayName
    })
    .from(userCommunityRoles)
    .innerJoin(users, eq(userCommunityRoles.userId, users.id))
    .where(eq(userCommunityRoles.communityRoleId, communityRoleId));
  return rows;
}

export async function countUsersByCommunityRoleId(communityRoleId: number) {
  const rows = await listUsersByCommunityRoleId(communityRoleId);
  return rows.length;
}

export async function ensureProfileExistsForUsers(userIds: string[]) {
  if (userIds.length === 0) {
    return;
  }
  const db = getDb();
  const existing = await db.select({ userId: profiles.userId }).from(profiles).where(inArray(profiles.userId, userIds));
  const existingSet = new Set(existing.map((row) => row.userId));
  const missingUserIds = userIds.filter((userId) => !existingSet.has(userId));
  if (missingUserIds.length === 0) {
    return;
  }
  await db.insert(profiles).values(missingUserIds.map((userId) => ({ userId })));
}
