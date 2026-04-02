import { eq } from "drizzle-orm";
import { landingSections } from "@guildora/shared";
import { requireInternalToken } from "../../../../utils/internal-auth";
import { getDb } from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  requireInternalToken(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing section ID." });

  const db = getDb();
  const [deleted] = await db
    .delete(landingSections)
    .where(eq(landingSections.id, id))
    .returning({ id: landingSections.id });

  if (!deleted) throw createError({ statusCode: 404, statusMessage: "Section not found." });
  return { success: true };
});
