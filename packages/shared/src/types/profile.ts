import type { PermissionRole } from "./roles";
import type { LocaleCode, UserLocalePreference } from "./locale";

export type AppearancePreference = "light" | "dark" | "system";

export interface CommunityProfile {
  id: string;
  userId: string;
  appearancePreference: AppearancePreference;
  localePreference: UserLocalePreference;
  effectiveLocale: LocaleCode;
  customFields: Record<string, unknown>;
  permissionRoles: PermissionRole[];
  communityRole: string | null;
}
