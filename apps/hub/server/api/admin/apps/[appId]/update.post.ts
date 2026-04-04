import { z } from "zod";
import { eq } from "drizzle-orm";
import { installedApps } from "@guildora/shared";
import { requireAdminSession } from "../../../../utils/auth";
import { getDb } from "../../../../utils/db";
import { readBodyWithSchema, requireRouterParam } from "../../../../utils/http";
import { installAppFromUrl, installAppFromLocalPath } from "../../../../utils/app-sideload";

const updateSchema = z.object({
  preserveConfig: z.boolean().default(true),
  preserveCodeBundle: z.boolean().default(true)
});

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const appId = requireRouterParam(event, "appId", "Missing app id.");
  const { preserveConfig, preserveCodeBundle } = await readBodyWithSchema(event, updateSchema, "Invalid update payload.", {
    emptyBodyValue: {}
  });

  const db = getDb();
  const rows = await db.select().from(installedApps).where(eq(installedApps.appId, appId)).limit(1);
  const existing = rows[0];

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "App not found." });
  }
  if (!existing.repositoryUrl) {
    throw createError({ statusCode: 422, statusMessage: "App has no repository URL and cannot be updated." });
  }

  if (existing.repositoryUrl.startsWith("file://")) {
    const localPath = existing.repositoryUrl.slice("file://".length);
    const result = await installAppFromLocalPath(localPath, {
      activate: existing.status === "active",
      verified: existing.verified,
      preserveConfig,
      preserveCodeBundle
    });
    return { ok: true, appId: result.appId };
  }

  const result = await installAppFromUrl(existing.repositoryUrl, {
    activate: existing.status === "active",
    verified: existing.verified,
    preserveAutoUpdate: true,
    preserveConfig,
    preserveCodeBundle
  });

  return { ok: true, appId: result.appId };
});
