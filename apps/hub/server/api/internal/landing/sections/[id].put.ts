import { eq } from "drizzle-orm";
import { landingSections } from "@guildora/shared";
import { z } from "zod";
import { requireInternalToken } from "../../../../utils/internal-auth";
import { getDb } from "../../../../utils/db";
import { readBodyWithSchema } from "../../../../utils/http";

const updateSectionSchema = z.object({
  blockType: z.string().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
  content: z.record(z.unknown()).optional()
});

export default defineEventHandler(async (event) => {
  requireInternalToken(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing section ID." });

  const body = await readBodyWithSchema(event, updateSectionSchema, "Invalid section update payload.");
  const db = getDb();

  const updateData: Record<string, unknown> = {};
  if (body.blockType !== undefined) updateData.blockType = body.blockType;
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
  if (body.visible !== undefined) updateData.visible = body.visible;
  if (body.config !== undefined) updateData.config = body.config;
  if (body.content !== undefined) updateData.content = body.content;

  const [updated] = await db
    .update(landingSections)
    .set(updateData)
    .where(eq(landingSections.id, id))
    .returning();

  if (!updated) throw createError({ statusCode: 404, statusMessage: "Section not found." });
  return { section: updated };
});
