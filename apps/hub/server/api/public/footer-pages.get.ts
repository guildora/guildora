import { asc, eq } from "drizzle-orm";
import { footerPages } from "@guildora/shared";
import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  const query = getQuery(event);
  const locale = typeof query.locale === "string" && query.locale.length >= 2 ? query.locale : "en";
  const slug = typeof query.slug === "string" ? query.slug : undefined;

  const db = getDb();

  const pages = await db
    .select()
    .from(footerPages)
    .where(eq(footerPages.visible, true))
    .orderBy(asc(footerPages.sortOrder));

  const localized = pages.map((page) => {
    const title = page.title as Record<string, string>;
    const content = page.content as Record<string, string>;
    return {
      id: page.id,
      slug: page.slug,
      title: title[locale] ?? title.en ?? "",
      content: content[locale] ?? content.en ?? ""
    };
  });

  if (slug) {
    const page = localized.find((p) => p.slug === slug);
    if (!page) throw createError({ statusCode: 404, statusMessage: "Page not found." });
    return { page };
  }

  return { pages: localized };
});
