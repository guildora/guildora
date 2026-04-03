import { eq } from "drizzle-orm";
import { footerPages } from "@guildora/shared";
import { requireAdminSession } from "../../../../utils/auth";
import { getDb } from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing page ID." });

  const db = getDb();
  const [deleted] = await db
    .delete(footerPages)
    .where(eq(footerPages.id, id))
    .returning({ id: footerPages.id });

  if (!deleted) throw createError({ statusCode: 404, statusMessage: "Footer page not found." });

  return { success: true };
});
