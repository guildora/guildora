import { asc, eq } from "drizzle-orm";
import { selectableDiscordRoles, userDiscordRoles } from "@guildora/shared";
import type { DiscordGuildMember, DiscordGuildRole } from "./botSync";
import { getDb } from "./db";

export type EditableDiscordRole = {
  discordRoleId: string;
  name: string;
  selected: boolean;
};

export type SelectableDiscordRoleRow = {
  discordRoleId: string;
  roleNameSnapshot: string;
};

export type UserDiscordRoleRow = {
  discordRoleId: string;
};

export function createDiscordRoleNameMap(guildRoles: DiscordGuildRole[]) {
  return new Map(guildRoles.map((role) => [role.id, role.name]));
}

function normalizeRoleIds(roleIds: string[]) {
  return Array.from(new Set(roleIds.filter((roleId) => roleId.trim().length > 0)));
}

export async function replaceUserDiscordRolesSnapshot(
  userId: string,
  roleIds: string[],
  roleNameById?: Map<string, string>
) {
  const db = getDb();
  const normalizedRoleIds = normalizeRoleIds(roleIds);

  await db.delete(userDiscordRoles).where(eq(userDiscordRoles.userId, userId));
  if (normalizedRoleIds.length === 0) {
    return;
  }

  const now = new Date();
  await db.insert(userDiscordRoles).values(
    normalizedRoleIds.map((discordRoleId) => ({
      userId,
      discordRoleId,
      roleNameSnapshot: roleNameById?.get(discordRoleId) || discordRoleId,
      syncedAt: now
    }))
  );
}

export async function replaceUserDiscordRolesSnapshotFromMember(
  userId: string,
  member: DiscordGuildMember,
  guildRoles: DiscordGuildRole[] = []
) {
  const roleNameById = createDiscordRoleNameMap(guildRoles);
  await replaceUserDiscordRolesSnapshot(userId, member.roleIds, roleNameById);
}

export async function listSelectableDiscordRoleRows() {
  const db = getDb();
  return db.select().from(selectableDiscordRoles).orderBy(asc(selectableDiscordRoles.roleNameSnapshot));
}

export async function listUserDiscordRoleRows(userId: string) {
  const db = getDb();
  return db.select().from(userDiscordRoles).where(eq(userDiscordRoles.userId, userId));
}

export function mapEditableDiscordRoles(
  selectableRows: SelectableDiscordRoleRow[],
  userRoleRows: UserDiscordRoleRow[]
): EditableDiscordRole[] {
  const selectedRoleIds = new Set(userRoleRows.map((row) => row.discordRoleId));
  return selectableRows.map((row) => ({
    discordRoleId: row.discordRoleId,
    name: row.roleNameSnapshot,
    selected: selectedRoleIds.has(row.discordRoleId)
  }));
}

export async function buildEditableDiscordRolesForUser(userId: string): Promise<EditableDiscordRole[]> {
  const [selectableRows, userRoleRows] = await Promise.all([
    listSelectableDiscordRoleRows(),
    listUserDiscordRoleRows(userId)
  ]);
  return mapEditableDiscordRoles(selectableRows, userRoleRows);
}

export async function saveSelectableDiscordRoleIds(discordRoleIds: string[], guildRoles: DiscordGuildRole[]) {
  const db = getDb();
  const normalizedRoleIds = normalizeRoleIds(discordRoleIds);
  const roleNameById = createDiscordRoleNameMap(guildRoles);

  await db.delete(selectableDiscordRoles);
  if (normalizedRoleIds.length === 0) {
    return;
  }

  await db.insert(selectableDiscordRoles).values(
    normalizedRoleIds.map((discordRoleId) => ({
      discordRoleId,
      roleNameSnapshot: roleNameById.get(discordRoleId) || discordRoleId
    }))
  );
}
