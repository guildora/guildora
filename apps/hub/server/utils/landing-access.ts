import { desc } from "drizzle-orm";
import { moderationSettings } from "@guildora/shared";
import type { GuildoraDatabase } from "@guildora/shared/db/client";

export interface LandingAccessConfig {
  allowModeratorAccess: boolean;
  allowModeratorAppsAccess: boolean;
}

export const defaultLandingAccessConfig: LandingAccessConfig = {
  allowModeratorAccess: true,
  allowModeratorAppsAccess: true
};

export function resolveAllowedLandingRoles(config: LandingAccessConfig): string[] {
  return config.allowModeratorAccess
    ? ["moderator", "admin", "superadmin"]
    : ["admin", "superadmin"];
}

export function resolveAllowedAppsRoles(config: LandingAccessConfig): string[] {
  return config.allowModeratorAppsAccess
    ? ["moderator", "admin", "superadmin"]
    : ["admin", "superadmin"];
}

export function hasLandingAccess(permissionRoles: string[], config: LandingAccessConfig): boolean {
  const allowed = resolveAllowedLandingRoles(config);
  return allowed.some((role) => permissionRoles.includes(role));
}

interface DbErrorLike {
  code?: string;
  message?: string;
}

function isMissingColumnError(error: unknown): boolean {
  const dbError = error as DbErrorLike;
  return dbError?.code === "42703" || dbError?.message?.includes("allow_moderator_apps_access") === true;
}

function isMissingTableError(error: unknown): boolean {
  const dbError = error as DbErrorLike;
  return dbError?.code === "42P01";
}

export async function loadLandingAccessConfig(db: GuildoraDatabase): Promise<LandingAccessConfig> {
  try {
    const [row] = await db
      .select({
        allowModeratorAccess: moderationSettings.allowModeratorAccess,
        allowModeratorAppsAccess: moderationSettings.allowModeratorAppsAccess
      })
      .from(moderationSettings)
      .orderBy(desc(moderationSettings.updatedAt))
      .limit(1);

    if (!row) {
      return defaultLandingAccessConfig;
    }

    return {
      allowModeratorAccess: Boolean(row.allowModeratorAccess),
      allowModeratorAppsAccess: Boolean(row.allowModeratorAppsAccess)
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return defaultLandingAccessConfig;
    }
    if (!isMissingColumnError(error)) {
      throw error;
    }
  }

  const [legacyRow] = await db
    .select({
      allowModeratorAccess: moderationSettings.allowModeratorAccess
    })
    .from(moderationSettings)
    .orderBy(desc(moderationSettings.updatedAt))
    .limit(1)
    .catch((legacyError: unknown) => {
      if (isMissingTableError(legacyError)) {
        return [];
      }
      throw legacyError;
    });

  if (!legacyRow) {
    return defaultLandingAccessConfig;
  }

  return {
    allowModeratorAccess: Boolean(legacyRow.allowModeratorAccess),
    allowModeratorAppsAccess: defaultLandingAccessConfig.allowModeratorAppsAccess
  };
}
