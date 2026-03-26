import { inArray } from "drizzle-orm";
import { users } from "@guildora/shared";
import { requireAdminSession } from "../../../utils/auth";
import { listSuperadminUserIds } from "../../../utils/admin-mirror";
import { getDb } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);

  const isDev = import.meta.dev || process.env.NODE_ENV === "development";
  if (!isDev) {
    throw createError({
      statusCode: 403,
      statusMessage: "This endpoint is only available in development mode."
    });
  }

  const db = getDb();
  const superadminIds = await listSuperadminUserIds();
  const allUsers = await db.select({ id: users.id }).from(users);
  const deletableIds = allUsers.map((row) => row.id).filter((id) => !superadminIds.has(id));
  if (deletableIds.length === 0) {
    return { deleted: 0 };
  }

  const deleted = await db.delete(users).where(inArray(users.id, deletableIds)).returning({ id: users.id });
  return { deleted: deleted.length };
});
