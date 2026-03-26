import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { applicationAccessSettings } from "@guildora/shared";
import { requireAdminSession } from "../../utils/auth";
import { readBodyWithSchema } from "../../utils/http";
import { getDb } from "../../utils/db";
import { loadApplicationAccessConfig } from "../../utils/application-access";

const schema = z.object({
  allowModeratorAccess: z.boolean()
});

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const body = await readBodyWithSchema(event, schema, "Invalid config payload.");
  const db = getDb();

  const [existing] = await db
    .select()
    .from(applicationAccessSettings)
    .orderBy(desc(applicationAccessSettings.updatedAt))
    .limit(1);

  if (existing) {
    await db
      .update(applicationAccessSettings)
      .set({
        allowModeratorAccess: body.allowModeratorAccess,
        updatedAt: new Date(),
        updatedBy: session.user.id
      })
      .where(eq(applicationAccessSettings.id, existing.id));
  } else {
    await db.insert(applicationAccessSettings).values({
      allowModeratorAccess: body.allowModeratorAccess,
      updatedBy: session.user.id
    });
  }

  return { accessConfig: await loadApplicationAccessConfig(db) };
});
