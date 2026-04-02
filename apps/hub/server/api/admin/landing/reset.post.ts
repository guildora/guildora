import { eq } from "drizzle-orm";
import { landingPages, landingSections } from "@guildora/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { defaultSections } from "@guildora/shared/db/seeds/landing-templates";

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);

  const db = getDb();

  await db.delete(landingSections);

  for (const section of defaultSections) {
    await db.insert(landingSections).values({
      blockType: section.blockType,
      sortOrder: section.sortOrder,
      visible: section.visible,
      config: section.config,
      content: section.content,
      updatedBy: session.user.id
    });
  }

  const [page] = await db.select().from(landingPages).limit(1);
  if (page) {
    await db
      .update(landingPages)
      .set({
        activeTemplate: "default",
        customCss: null,
        updatedBy: session.user.id
      })
      .where(eq(landingPages.id, page.id));
  }

  return { success: true };
});
