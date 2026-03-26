import { and, eq } from "drizzle-orm";
import {
  communityRoles,
  permissionRoles,
  profiles,
  userCommunityRoles,
  userPermissionRoles,
  users
} from "@guildora/shared";
import { getDb } from "./db";

const basePermissionRoles = [
  { name: "temporaer", description: "Temporary applicant permissions.", level: 0 },
  { name: "user", description: "Default community user role.", level: 10 },
  { name: "moderator", description: "Can moderate community content.", level: 50 },
  { name: "admin", description: "Full administrative permissions.", level: 80 },
  { name: "superadmin", description: "System owner with full access.", level: 100 }
] as const;

export async function ensureBaseRoles() {
  const db = getDb();
  for (const role of basePermissionRoles) {
    const existing = await db.select().from(permissionRoles).where(eq(permissionRoles.name, role.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(permissionRoles).values(role);
    }
  }

  const mitglied = await db.select().from(communityRoles).where(eq(communityRoles.name, "Mitglied")).limit(1);
  if (mitglied.length === 0) {
    const userRole = await db.select().from(permissionRoles).where(eq(permissionRoles.name, "user")).limit(1);
    if (userRole[0]) {
      await db.insert(communityRoles).values({
        name: "Mitglied",
        description: "Aktive Community-Mitglieder.",
        permissionRoleId: userRole[0].id,
        sortOrder: 30
      });
    }
  }
}

export async function ensureDiscordUser(discordUser: {
  discordId: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const db = getDb();
  await ensureBaseRoles();
  const existing = await db.select().from(users).where(eq(users.discordId, discordUser.discordId)).limit(1);

  const user =
    existing[0] ??
    (
      await db
        .insert(users)
        .values({
          discordId: discordUser.discordId,
          displayName: discordUser.displayName,
          avatarUrl: discordUser.avatarUrl
        })
        .returning()
    )[0];

  if (existing[0]) {
    await db
      .update(users)
      .set({
        displayName: discordUser.displayName,
        avatarUrl: discordUser.avatarUrl
      })
      .where(eq(users.id, user.id));
  }

  const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  if (profile.length === 0) {
    await db.insert(profiles).values({ userId: user.id });
  }

  const defaultRole = await db.select().from(permissionRoles).where(eq(permissionRoles.name, "user")).limit(1);
  if (defaultRole[0]) {
    const assignment = await db
      .select()
      .from(userPermissionRoles)
      .where(and(eq(userPermissionRoles.userId, user.id), eq(userPermissionRoles.permissionRoleId, defaultRole[0].id)))
      .limit(1);
    if (assignment.length === 0) {
      await db.insert(userPermissionRoles).values({ userId: user.id, permissionRoleId: defaultRole[0].id });
    }
  }

  const mitgliedRole = await db.select().from(communityRoles).where(eq(communityRoles.name, "Mitglied")).limit(1);
  if (mitgliedRole[0]) {
    const communityAssignment = await db
      .select()
      .from(userCommunityRoles)
      .where(eq(userCommunityRoles.userId, user.id))
      .limit(1);
    if (communityAssignment.length === 0) {
      await db.insert(userCommunityRoles).values({
        userId: user.id,
        communityRoleId: mitgliedRole[0].id
      });
    }
  }

  return user;
}

export async function getUserProfileByDiscordId(discordId: string) {
  const db = getDb();
  const userRows = await db.select().from(users).where(eq(users.discordId, discordId)).limit(1);
  if (userRows.length === 0) {
    return null;
  }

  const user = userRows[0];
  const profileRows = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const roleRows = await db
    .select({ role: permissionRoles.name })
    .from(userPermissionRoles)
    .innerJoin(permissionRoles, eq(userPermissionRoles.permissionRoleId, permissionRoles.id))
    .where(eq(userPermissionRoles.userId, user.id));

  return {
    ...user,
    profile: profileRows[0] ?? null,
    roles: roleRows.map((row) => row.role)
  };
}

export async function getUserByDiscordId(discordId: string) {
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.discordId, discordId)).limit(1);
  return rows[0] ?? null;
}
