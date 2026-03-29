import { eq } from "drizzle-orm";
import { membershipSettings, type RoleCleanupConfig } from "@guildora/shared";
import type { getDb } from "./db";

type DbClient = ReturnType<typeof getDb>;

export const MEMBERSHIP_SETTINGS_SINGLETON_ID = 1;

export interface MembershipSettingsRow {
  applicationsRequired: boolean;
  defaultCommunityRoleId: number | null;
  requiredLoginRoleId: string | null;
  autoSyncEnabled: boolean;
  autoSyncIntervalHours: number;
  autoSyncLastRun: Date | null;
  autoCleanupEnabled: boolean;
  autoCleanupIntervalHours: number;
  autoCleanupLastRun: Date | null;
  cleanupRoleConfigs: RoleCleanupConfig[];
  cleanupRoleWhitelist: string[];
  cleanupProtectModerators: boolean;
}

const defaultSettings: MembershipSettingsRow = {
  applicationsRequired: true,
  defaultCommunityRoleId: null,
  requiredLoginRoleId: null,
  autoSyncEnabled: false,
  autoSyncIntervalHours: 24,
  autoSyncLastRun: null,
  autoCleanupEnabled: false,
  autoCleanupIntervalHours: 24,
  autoCleanupLastRun: null,
  cleanupRoleConfigs: [],
  cleanupRoleWhitelist: [],
  cleanupProtectModerators: true
};

// Simple TTL cache (same pattern as community-settings.ts)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  value: MembershipSettingsRow;
  expiresAt: number;
}

const settingsCache: { entry: CacheEntry | null } = { entry: null };

export function invalidateMembershipSettingsCache() {
  settingsCache.entry = null;
}

export async function loadMembershipSettings(db: DbClient): Promise<MembershipSettingsRow> {
  const now = Date.now();
  if (settingsCache.entry && now < settingsCache.entry.expiresAt) {
    return settingsCache.entry.value;
  }

  const [row] = await db
    .select()
    .from(membershipSettings)
    .where(eq(membershipSettings.id, MEMBERSHIP_SETTINGS_SINGLETON_ID))
    .limit(1);

  if (!row) {
    settingsCache.entry = { value: defaultSettings, expiresAt: now + CACHE_TTL_MS };
    return defaultSettings;
  }

  const value: MembershipSettingsRow = {
    applicationsRequired: row.applicationsRequired,
    defaultCommunityRoleId: row.defaultCommunityRoleId,
    requiredLoginRoleId: row.requiredLoginRoleId,
    autoSyncEnabled: row.autoSyncEnabled,
    autoSyncIntervalHours: row.autoSyncIntervalHours,
    autoSyncLastRun: row.autoSyncLastRun,
    autoCleanupEnabled: row.autoCleanupEnabled,
    autoCleanupIntervalHours: row.autoCleanupIntervalHours,
    autoCleanupLastRun: row.autoCleanupLastRun,
    cleanupRoleConfigs: (row.cleanupRoleConfigs as RoleCleanupConfig[]) ?? [],
    cleanupRoleWhitelist: (row.cleanupRoleWhitelist as string[]) ?? [],
    cleanupProtectModerators: row.cleanupProtectModerators
  };

  settingsCache.entry = { value, expiresAt: now + CACHE_TTL_MS };
  return value;
}
