import { z } from "zod";
import { eq } from "drizzle-orm";
import { roleGroups } from "@guildora/shared";
import { requireAdminSession } from "../../../../../utils/auth";
import { getDb } from "../../../../../utils/db";
import { readBodyWithSchema } from "../../../../../utils/http";
import { upsertGroupRoles } from "../../../../../utils/role-groups";

const schema = z.object({
  roles: z.array(
    z.object({
      discordRoleId: z.string().trim().min(1),
      emoji: z.string().trim().nullable().default(null),
      sortOrder: z.number().int().min(0).default(0)
    })
  )
});

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing group id." });

  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.");
  const db = getDb();

  // Verify group exists
  const [group] = await db
    .select({ id: roleGroups.id })
    .from(roleGroups)
    .where(eq(roleGroups.id, id));

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: "Role group not found." });
  }

  await upsertGroupRoles(id, parsed.roles);

  return { ok: true };
});
