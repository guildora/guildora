export type PermissionRole = "temporaer" | "user" | "moderator" | "admin" | "superadmin";

export interface CommunityRole {
  id: number;
  name: string;
  permissionRole: PermissionRole;
  discordRoleId?: string | null;
}
