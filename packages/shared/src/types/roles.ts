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

export interface SelectableRoleWithEmoji {
  discordRoleId: string;
  roleNameSnapshot: string;
  emoji: string | null;
  sortOrder: number;
}

export interface RoleGroup {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  roles: SelectableRoleWithEmoji[];
  embed?: {
    id: string;
    channelId: string;
    messageId: string | null;
  } | null;
}
