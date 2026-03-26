export type PermissionRole = "temporaer" | "user" | "moderator" | "admin" | "superadmin";

export interface CommunityRole {
  id: number;
  name: string;
  permissionRole: PermissionRole;
  discordRoleId?: string | null;
}

export const roleHierarchy: Record<string, string[]> = {
  superadmin: ["superadmin", "admin", "moderator", "user"],
  admin: ["admin", "moderator", "user"],
  moderator: ["moderator", "user"],
  user: ["user"]
};
