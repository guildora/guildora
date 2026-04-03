import { eq } from "drizzle-orm";
import { landingPages, landingSections } from "@guildora/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const db = getDb();

  const [page] = await db.select().from(landingPages).limit(1);
  if (!page) throw createError({ statusCode: 404, statusMessage: "No landing page found." });

  // Set publishedAt to null and all sections to draft
  await db
    .update(landingPages)
    .set({ publishedAt: null, updatedBy: session.user.id })
    .where(eq(landingPages.id, page.id));

  await db
    .update(landingSections)
    .set({ status: "draft" })
    .where(eq(landingSections.status, "published"));

  return { success: true };
});
