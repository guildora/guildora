import { desc } from "drizzle-orm";
import { installedApps } from "@newguildplus/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const db = getDb();

  const appsRows = await db.select().from(installedApps).orderBy(desc(installedApps.updatedAt));

  return {
    apps: appsRows,
    stats: {
      installed: appsRows.length,
      active: appsRows.filter((item) => item.status === "active").length
    }
  };
});
