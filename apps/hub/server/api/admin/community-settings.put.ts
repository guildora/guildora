import { z } from "zod";
import { eq } from "drizzle-orm";
import { communitySettings } from "@newguildplus/shared";
import { requireAdminSession } from "../../utils/auth";
import { getDb } from "../../utils/db";
import { readBodyWithSchema } from "../../utils/http";
import { localePreferences, normalizeCommunityDefaultLocale } from "../../../utils/locale-preference";
import { COMMUNITY_SETTINGS_SINGLETON_ID } from "../../utils/community-settings";

const schema = z.object({
  communityName: z.string().trim().max(200).nullable(),
  defaultLocale: z.enum(localePreferences).optional()
});

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.");

  const db = getDb();
  const [existing] = await db
    .select()
    .from(communitySettings)
    .where(eq(communitySettings.id, COMMUNITY_SETTINGS_SINGLETON_ID))
    .limit(1);

  const value = parsed.communityName === "" ? null : parsed.communityName;
  const defaultLocale = normalizeCommunityDefaultLocale(parsed.defaultLocale ?? existing?.defaultLocale, "en");

  if (existing) {
    await db
      .update(communitySettings)
      .set({
        communityName: value,
        defaultLocale,
        updatedAt: new Date(),
        updatedBy: session.user.id
      })
      .where(eq(communitySettings.id, COMMUNITY_SETTINGS_SINGLETON_ID));
  } else {
    await db.insert(communitySettings).values({
      id: COMMUNITY_SETTINGS_SINGLETON_ID,
      communityName: value,
      defaultLocale,
      updatedBy: session.user.id
    });
  }

  return { communityName: value, defaultLocale };
});
