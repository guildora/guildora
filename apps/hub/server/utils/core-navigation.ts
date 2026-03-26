export type NavigationLocale = "en" | "de";
export type CoreNavigationOptions = {
  allowModeratorCmsAccess?: boolean;
};

export type CoreRailItem = {
  id: string;
  to: string;
  label: string;
  labelKey?: string;
  iconPath: string;
  order: number;
  requiredRoles: string[];
};

export type CorePanelGroup = {
  id: string;
  railItemId: string;
  title?: string;
  titleKey?: string;
  order: number;
  items: Array<{
    id: string;
    label: string;
    labelKey?: string;
    to: string;
    iconPath?: string;
    requiredRoles: string[];
  }>;
};

const iconNames = {
  dashboard: "proicons:home",
  members: "proicons:person-multiple",
  profile: "proicons:person",
  moderation: "proicons:shield",
  admin: "proicons:lock",
  marketplace: "proicons:cart",
  cms: "proicons:document"
} as const;

function isSupportedLocale(value: string): value is NavigationLocale {
  return value === "en" || value === "de";
}

export function resolveNavigationLocale(value: string | null | undefined): NavigationLocale {
  const normalized = value?.trim().toLowerCase() || "en";
  return isSupportedLocale(normalized) ? normalized : "en";
}

export function getLocalizedCoreNavigation(locale: NavigationLocale, options: CoreNavigationOptions = {}) {
  const allowModeratorCmsAccess = options.allowModeratorCmsAccess ?? true;
  const cmsRequiredRoles = allowModeratorCmsAccess ? ["moderator", "admin", "superadmin"] : ["admin", "superadmin"];
  void locale;

  const labels = {
    dashboard: { label: "Dashboard", key: "nav.dashboard" },
    members: { label: "Members", key: "nav.members" },
    profile: { label: "Profile", key: "nav.profile" },
    moderation: { label: "Moderation", key: "nav.moderation" },
    admin: { label: "Admin", key: "nav.admin" },
    marketplace: { label: "Marketplace", key: "nav.marketplace" },
    cms: { label: "Landing page", key: "nav.cms" },
    overview: { label: "Overview", key: "dashboard.title" },
    memberList: { label: "Member list", key: "members.title" },
    profileDesign: { label: "Settings", key: "profile.designTitle" },
    profileName: { label: "Name", key: "profile.nameTitle" },
    profileRoles: { label: "Discord Roles", key: "profile.rolesTitle" },
    administration: { label: "Administration", key: "admin.title" },
    permissions: { label: "Permissions", key: "admin.roles" },
    design: { label: "Design", key: "adminTheme.title" },
    apps: { label: "Apps", key: "admin.apps" },
    communitySettings: { label: "Community Settings", key: "adminDiscordRoles.title" },
    devRoleSwitcher: { label: "DEV", key: "devRoleSwitcher.title" },
    modUsers: { label: "User Management", key: "moderation.userManagement" },
    modApplications: { label: "Applications", key: "moderation.applications" }
  } as const;

  const coreRailItems: CoreRailItem[] = [
    { id: "dashboard", to: "/dashboard", label: labels.dashboard.label, labelKey: labels.dashboard.key, iconPath: iconNames.dashboard, order: 10, requiredRoles: [] },
    { id: "members", to: "/members", label: labels.members.label, labelKey: labels.members.key, iconPath: iconNames.members, order: 20, requiredRoles: [] },
    { id: "profile", to: "/profile", label: labels.profile.label, labelKey: labels.profile.key, iconPath: iconNames.profile, order: 30, requiredRoles: [] },
    {
      id: "moderation",
      to: "/mod",
      label: labels.moderation.label,
      labelKey: labels.moderation.key,
      iconPath: iconNames.moderation,
      order: 50,
      requiredRoles: ["moderator", "admin", "superadmin"]
    },
    { id: "admin", to: "/admin", label: labels.admin.label, labelKey: labels.admin.key, iconPath: iconNames.admin, order: 60, requiredRoles: ["admin", "superadmin"] },
    { id: "marketplace", to: "/marketplace", label: labels.marketplace.label, labelKey: labels.marketplace.key, iconPath: iconNames.marketplace, order: 70, requiredRoles: [] },
    { id: "cms", to: "/cms", label: labels.cms.label, labelKey: labels.cms.key, iconPath: iconNames.cms, order: 80, requiredRoles: cmsRequiredRoles }
  ];

  const corePanelGroups: CorePanelGroup[] = [
    {
      id: "dashboard-main",
      railItemId: "dashboard",
      title: labels.dashboard.label,
      titleKey: labels.dashboard.key,
      order: 10,
      items: [{ id: "dashboard-home", label: labels.overview.label, labelKey: labels.overview.key, to: "/dashboard", requiredRoles: [] }]
    },
    {
      id: "members-main",
      railItemId: "members",
      title: labels.members.label,
      titleKey: labels.members.key,
      order: 10,
      items: [{ id: "members-list", label: labels.memberList.label, labelKey: labels.memberList.key, to: "/members", requiredRoles: [] }]
    },
    {
      id: "profile-main",
      railItemId: "profile",
      title: labels.profile.label,
      titleKey: labels.profile.key,
      order: 10,
      items: [
        { id: "profile-name", label: labels.profileName.label, labelKey: labels.profileName.key, to: "/profile/name", requiredRoles: [] },
        { id: "profile-roles", label: labels.profileRoles.label, labelKey: labels.profileRoles.key, to: "/profile/roles", requiredRoles: [] },
        { id: "profile-design", label: labels.profileDesign.label, labelKey: labels.profileDesign.key, to: "/profile/design", requiredRoles: [] }
      ]
    },
    {
      id: "moderation-main",
      railItemId: "moderation",
      title: labels.moderation.label,
      titleKey: labels.moderation.key,
      order: 10,
      items: [
        { id: "mod-users", label: labels.modUsers.label, labelKey: labels.modUsers.key, to: "/mod/users", requiredRoles: ["moderator", "admin", "superadmin"] },
        { id: "mod-applications", label: labels.modApplications.label, labelKey: labels.modApplications.key, to: "/mod/applications", requiredRoles: ["moderator", "admin", "superadmin"] }
      ]
    },
    {
      id: "admin-main",
      railItemId: "admin",
      title: labels.administration.label,
      titleKey: labels.administration.key,
      order: 10,
      items: [
        { id: "admin-design", label: labels.design.label, labelKey: labels.design.key, to: "/admin/design", requiredRoles: ["admin", "superadmin"] },
        { id: "admin-permissions", label: labels.permissions.label, labelKey: labels.permissions.key, to: "/admin/permissions", requiredRoles: ["admin", "superadmin"] },
        { id: "admin-discord-roles", label: labels.communitySettings.label, labelKey: labels.communitySettings.key, to: "/admin/discord-roles", requiredRoles: ["admin", "superadmin"] },
        { id: "admin-dev-role-switcher", label: labels.devRoleSwitcher.label, labelKey: labels.devRoleSwitcher.key, to: "/admin/dev-role-switcher", requiredRoles: ["admin", "superadmin"] },
        { id: "admin-apps", label: labels.apps.label, labelKey: labels.apps.key, to: "/admin/apps", requiredRoles: ["admin", "superadmin"] }
      ]
    },
    {
      id: "marketplace-main",
      railItemId: "marketplace",
      title: labels.marketplace.label,
      titleKey: labels.marketplace.key,
      order: 10,
      items: [{ id: "marketplace-list", label: labels.marketplace.label, labelKey: labels.marketplace.key, to: "/marketplace", requiredRoles: [] }]
    },
    {
      id: "cms-main",
      railItemId: "cms",
      title: labels.cms.label,
      titleKey: labels.cms.key,
      order: 10,
      items: [{ id: "cms-admin", label: labels.cms.label, labelKey: labels.cms.key, to: "/cms", requiredRoles: cmsRequiredRoles }]
    }
  ];

  return { coreRailItems, corePanelGroups };
}
