import { z } from "zod";
import { eq } from "drizzle-orm";
import { roleGroups } from "@guildora/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { readBodyWithSchema } from "../../../utils/http";

const schema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional()
});

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing group id." });

  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.");
  const db = getDb();

  const [updated] = await db
    .update(roleGroups)
    .set(parsed)
    .where(eq(roleGroups.id, id))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Role group not found." });
  }

  return { group: updated };
});
