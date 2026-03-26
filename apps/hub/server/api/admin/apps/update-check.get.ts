import { and, isNotNull, eq } from "drizzle-orm";
import { installedApps, safeParseAppManifest } from "@guildora/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { resolveManifestUrls, fetchManifestInput } from "../../../utils/app-sideload";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const db = getDb();

  const rows = await db
    .select()
    .from(installedApps)
    .where(and(isNotNull(installedApps.repositoryUrl), eq(installedApps.source, "sideloaded")));

  const updates = await Promise.all(
    rows.map(async (app) => {
      try {
        const urls = resolveManifestUrls(app.repositoryUrl!);
        const { input } = await fetchManifestInput(urls);
        const parsed = safeParseAppManifest(input);
        const remoteVersion = parsed.success ? parsed.data.version : null;
        const updateAvailable = remoteVersion !== null && remoteVersion !== app.version;
        return { appId: app.appId, remoteVersion, updateAvailable };
      } catch {
        return { appId: app.appId, remoteVersion: null, updateAvailable: false, checkError: true };
      }
    })
  );

  return { updates };
});
