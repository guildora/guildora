import { eq } from "drizzle-orm";
import { footerPages } from "@guildora/shared";
import { z } from "zod";
import { requireAdminSession } from "../../../../utils/auth";
import { getDb } from "../../../../utils/db";
import { readBodyWithSchema } from "../../../../utils/http";

const updatePageSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  title: z.record(z.string()).optional(),
  content: z.record(z.string()).optional(),
  sortOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional()
});

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing page ID." });

  const body = await readBodyWithSchema(event, updatePageSchema, "Invalid footer page update payload.");
  const db = getDb();

  const updateData: Record<string, unknown> = { updatedBy: session.user.id };
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
  if (body.visible !== undefined) updateData.visible = body.visible;

  const [updated] = await db
    .update(footerPages)
    .set(updateData)
    .where(eq(footerPages.id, id))
    .returning();

  if (!updated) throw createError({ statusCode: 404, statusMessage: "Footer page not found." });

  return { page: updated };
});
