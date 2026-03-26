import { eq } from "drizzle-orm";
import { communitySettings } from "@guildora/shared";
import type { CommunityDefaultLocale } from "@guildora/shared";
import type { getDb } from "./db";
import { normalizeCommunityDefaultLocale } from "../../utils/locale-preference";

type DbClient = ReturnType<typeof getDb>;

export const COMMUNITY_SETTINGS_SINGLETON_ID = 1;

export async function loadCommunitySettingsLocale(db: DbClient): Promise<CommunityDefaultLocale> {
  const [row] = await db
    .select({ defaultLocale: communitySettings.defaultLocale })
    .from(communitySettings)
    .where(eq(communitySettings.id, COMMUNITY_SETTINGS_SINGLETON_ID))
    .limit(1);

  return normalizeCommunityDefaultLocale(row?.defaultLocale, "en");
}
