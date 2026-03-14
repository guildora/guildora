import { desc } from "drizzle-orm";
import { cmsAccessSettings, type NewGuildPlusDatabase } from "@newguildplus/shared";

export interface CmsAccessConfig {
  allowModeratorAccess: boolean;
}

export const defaultCmsAccessConfig: CmsAccessConfig = {
  allowModeratorAccess: true
};

export function resolveAllowedCmsRoles(config: CmsAccessConfig): string[] {
  return config.allowModeratorAccess
    ? ["moderator", "admin", "superadmin"]
    : ["admin", "superadmin"];
}

export function hasCmsAccess(permissionRoles: string[], config: CmsAccessConfig): boolean {
  const allowed = resolveAllowedCmsRoles(config);
  return allowed.some((role) => permissionRoles.includes(role));
}

export async function loadCmsAccessConfig(db: NewGuildPlusDatabase): Promise<CmsAccessConfig> {
  const [row] = await db
    .select({
      allowModeratorAccess: cmsAccessSettings.allowModeratorAccess
    })
    .from(cmsAccessSettings)
    .orderBy(desc(cmsAccessSettings.updatedAt))
    .limit(1);

  if (!row) {
    return defaultCmsAccessConfig;
  }

  return {
    allowModeratorAccess: Boolean(row.allowModeratorAccess)
  };
}
