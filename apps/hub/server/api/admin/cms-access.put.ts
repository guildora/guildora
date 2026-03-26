import { desc, eq } from "drizzle-orm";
import { cmsAccessSettings } from "@guildora/shared";
import { z } from "zod";
import { requireAdminSession } from "../../utils/auth";
import { loadCmsAccessConfig } from "../../utils/cms-access";
import { getDb } from "../../utils/db";
import { readBodyWithSchema } from "../../utils/http";

const cmsAccessSchema = z.object({
  allowModeratorAccess: z.boolean()
});

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const parsed = await readBodyWithSchema(event, cmsAccessSchema, "Invalid CMS access payload.");

  const db = getDb();
  const [existingSettings] = await db.select().from(cmsAccessSettings).orderBy(desc(cmsAccessSettings.updatedAt)).limit(1);

  if (existingSettings) {
    await db
        .update(cmsAccessSettings)
        .set({
        allowModeratorAccess: parsed.allowModeratorAccess,
          updatedAt: new Date(),
          updatedBy: session.user.id
        })
      .where(eq(cmsAccessSettings.id, existingSettings.id));
  } else {
    await db.insert(cmsAccessSettings).values({
      allowModeratorAccess: parsed.allowModeratorAccess,
      updatedBy: session.user.id
    });
  }

  return {
    cmsAccess: await loadCmsAccessConfig(db)
  };
});
