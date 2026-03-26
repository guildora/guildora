import type { PermissionRole } from "./roles";

export interface CommunityUser {
  id: string;
  discordId: string;
  email: string | null;
  profileName: string;
  avatarUrl: string | null;
  avatarSource: string | null;
  primaryDiscordRoleName: string | null;
  permissionRoles: PermissionRole[];
  communityRole: string | null;
}
