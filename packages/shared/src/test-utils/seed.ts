/**
 * Minimal test seed data for integration tests.
 * Creates 1 community setup with 5 users (one per permission role).
 */

import { sql } from "drizzle-orm";
import type { GuildoraDatabase } from "../db/client";

export interface SeededData {
  users: {
    superadmin: { id: string; discordId: string };
    admin: { id: string; discordId: string };
    moderator: { id: string; discordId: string };
    user: { id: string; discordId: string };
    temporaer: { id: string; discordId: string };
  };
  permissionRoles: {
    superadmin: { id: number };
    admin: { id: number };
    moderator: { id: number };
    user: { id: number };
    temporaer: { id: number };
  };
  communityRoles: {
    admin: { id: string };
    moderator: { id: string };
    user: { id: string };
    temporaer: { id: string };
  };
}

export async function seedTestData(db: GuildoraDatabase): Promise<SeededData> {
  // 1. Insert permission roles
  const permRoles = await db.execute<{ id: number; name: string }>(sql`
    INSERT INTO "permission_roles" ("name", "description", "level")
    VALUES
      ('temporaer', 'Temporary applicant', 0),
      ('user', 'Default user', 10),
      ('moderator', 'Moderator', 50),
      ('admin', 'Admin', 80),
      ('superadmin', 'Superadmin', 100)
    ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description"
    RETURNING "id", "name"
  `);

  const permRoleMap = Object.fromEntries(
    permRoles.map((r) => [r.name, { id: r.id }])
  ) as SeededData["permissionRoles"];

  // 2. Insert community roles (linked to permission roles)
  const commRoles = await db.execute<{ id: string; name: string }>(sql`
    INSERT INTO "community_roles" ("name", "description", "discord_role_id", "permission_role_id", "sort_order")
    VALUES
      ('Temporaer', 'Temp role', NULL, ${permRoleMap.temporaer.id}, 10),
      ('User', 'User role', NULL, ${permRoleMap.user.id}, 20),
      ('Moderator', 'Mod role', NULL, ${permRoleMap.moderator.id}, 30),
      ('Admin', 'Admin role', NULL, ${permRoleMap.admin.id}, 40)
    ON CONFLICT DO NOTHING
    RETURNING "id", "name"
  `);

  const commRoleMap: Record<string, { id: string }> = {};
  for (const r of commRoles) {
    commRoleMap[r.name.toLowerCase()] = { id: r.id };
  }

  // 3. Insert test users
  const testUsers = await db.execute<{ id: string; discord_id: string; display_name: string }>(sql`
    INSERT INTO "users" ("discord_id", "email", "display_name", "avatar_url")
    VALUES
      ('discord-superadmin', 'superadmin@test.guildora.dev', 'Test Superadmin', NULL),
      ('discord-admin', 'admin@test.guildora.dev', 'Test Admin', NULL),
      ('discord-moderator', 'moderator@test.guildora.dev', 'Test Moderator', NULL),
      ('discord-user', 'user@test.guildora.dev', 'Test User', NULL),
      ('discord-temporaer', 'temporaer@test.guildora.dev', 'Test Temporaer', NULL)
    RETURNING "id", "discord_id", "display_name"
  `);

  const userMap: Record<string, { id: string; discordId: string }> = {};
  for (const u of testUsers) {
    const role = u.display_name.replace("Test ", "").toLowerCase();
    userMap[role] = { id: u.id, discordId: u.discord_id };
  }

  // 4. Assign permission roles to users
  for (const [role, user] of Object.entries(userMap)) {
    const permRole = permRoleMap[role as keyof typeof permRoleMap];
    if (permRole) {
      await db.execute(sql`
        INSERT INTO "user_permission_roles" ("user_id", "permission_role_id")
        VALUES (${user.id}, ${permRole.id})
        ON CONFLICT DO NOTHING
      `);
    }
  }

  // 5. Assign community roles to users
  for (const [role, user] of Object.entries(userMap)) {
    const commRole = commRoleMap[role];
    if (commRole) {
      await db.execute(sql`
        INSERT INTO "user_community_roles" ("user_id", "community_role_id")
        VALUES (${user.id}, ${commRole.id})
        ON CONFLICT DO NOTHING
      `);
    }
  }

  return {
    users: userMap as SeededData["users"],
    permissionRoles: permRoleMap,
    communityRoles: commRoleMap as SeededData["communityRoles"],
  };
}
