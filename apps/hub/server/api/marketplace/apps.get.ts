import { eq, desc } from "drizzle-orm";
import { appMarketplaceSubmissions } from "@guildora/shared";
import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const corsOrigin = process.env.MARKETPLACE_CORS_ORIGIN ?? "*";
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": corsOrigin,
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
  });

  const db = getDb();
  const rows = await db
    .select()
    .from(appMarketplaceSubmissions)
    .where(eq(appMarketplaceSubmissions.status, "approved"))
    .orderBy(desc(appMarketplaceSubmissions.createdAt));

  return {
    items: rows.map((row) => {
      const m = row.manifest;
      return {
        id: row.id,
        appId: row.appId,
        name: row.name,
        version: row.version,
        sourceUrl: row.sourceUrl,
        manifest: {
          id: m.id,
          name: m.name,
          version: m.version,
          author: m.author,
          description: m.description,
          homepageUrl: m.homepageUrl,
          repositoryUrl: m.repositoryUrl,
          license: m.license,
          permissions: m.permissions,
          configFields: m.configFields,
          compatibility: m.compatibility
        },
        reviewedAt: row.reviewedAt,
        createdAt: row.createdAt
      };
    })
  };
});
