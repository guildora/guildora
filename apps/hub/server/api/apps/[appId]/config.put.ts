import { eq } from "drizzle-orm";
import { z } from "zod";
import { installedApps } from "@newguildplus/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { readBodyWithSchema, requireRouterParam } from "../../../utils/http";

const configSchema = z.object({
  config: z.record(z.unknown())
});

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const appId = requireRouterParam(event, "appId", "Missing app id.");
  const parsed = await readBodyWithSchema(event, configSchema, "Invalid config payload.");

  const db = getDb();
  await db.update(installedApps).set({ config: parsed.config }).where(eq(installedApps.appId, appId));
  return { ok: true };
});
