import { eq } from "drizzle-orm";
import { landingPages, landingTemplates } from "@guildora/shared";
import { z } from "zod";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { readBodyWithSchema } from "../../../utils/http";

const switchTemplateSchema = z.object({
  templateId: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const body = await readBodyWithSchema(event, switchTemplateSchema, "Invalid template switch payload.");

  const db = getDb();

  const [template] = await db
    .select()
    .from(landingTemplates)
    .where(eq(landingTemplates.id, body.templateId))
    .limit(1);

  if (!template) throw createError({ statusCode: 404, statusMessage: "Template not found." });

  const [page] = await db.select().from(landingPages).limit(1);

  if (page) {
    await db
      .update(landingPages)
      .set({ activeTemplate: body.templateId, updatedBy: session.user.id })
      .where(eq(landingPages.id, page.id));
  } else {
    await db.insert(landingPages).values({
      activeTemplate: body.templateId,
      locale: "en",
      updatedBy: session.user.id
    });
  }

  return { success: true, templateId: body.templateId };
});
