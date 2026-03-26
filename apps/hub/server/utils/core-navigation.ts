export type NavigationLocale = "en" | "de";
export type CoreNavigationOptions = {
  allowModeratorCmsAccess?: boolean;
  allowModeratorAppsAccess?: boolean;
  allowModeratorApplicationsAccess?: boolean;
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
  applications: "proicons:checkmark-circle",
  admin: "proicons:lock",
  cms: "proicons:document",
  apps: "proicons:grid"
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
  const allowModeratorAppsAccess = options.allowModeratorAppsAccess ?? true;
  const allowModeratorApplicationsAccess = options.allowModeratorApplicationsAccess ?? true;
  const cmsRequiredRoles = allowModeratorCmsAccess ? ["moderator", "admin", "superadmin"] : ["admin", "superadmin"];
  const appsRequiredRoles = allowModeratorAppsAccess ? ["moderator", "admin", "superadmin"] : ["admin", "superadmin"];
  const applicationsRequiredRoles = allowModeratorApplicationsAccess ? ["moderator", "admin", "superadmin"] : ["admin", "superadmin"];
  void locale;

  const labels = {
    dashboard: { label: "Dashboard", key: "nav.dashboard" },
    members: { label: "Members", key: "nav.members" },
    profile: { label: "Profile", key: "nav.profile" },
    moderation: { label: "Moderation", key: "nav.moderation" },
    admin: { label: "Admin", key: "nav.admin" },
    cms: { label: "Landing page", key: "nav.cms" },
    overview: { label: "Overview", key: "dashboard.title" },
    memberList: { label: "Member list", key: "members.title" },
    profileDesign: { label: "Settings", key: "profile.designTitle" },
    profileName: { label: "Name", key: "profile.nameTitle" },
    profileRoles: { label: "Discord Roles", key: "profile.rolesTitle" },
    administration: { label: "Administration", key: "admin.title" },
    permissions: { label: "Permissions", key: "admin.roles" },
    design: { label: "Design", key: "adminTheme.title" },
    appsSection: { label: "Apps", key: "nav.apps" },
    appsOverview: { label: "Overview", key: "adminApps.overviewNavLabel" },
    appsSideload: { label: "Sideloading", key: "adminApps.sideloadTitle" },
    appsExplore: { label: "Explore Apps", key: "adminApps.exploreNavLabel" },
    communitySettings: { label: "Community Settings", key: "adminDiscordRoles.title" },
    devRoleSwitcher: { label: "DEV", key: "devRoleSwitcher.title" },
    modUsers: { label: "User Management", key: "moderation.userManagement" },
    applicationsSection: { label: "Applications", key: "nav.applications" },
    applicationsFlows: { label: "Flows", key: "applications.flows" },
    applicationsOpen: { label: "Open Applications", key: "applications.open" },
    applicationsArchive: { label: "Archive", key: "applications.archive" },
    applicationsConfig: { label: "Settings", key: "applications.config" }
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
    {
      id: "applications",
      to: "/applications",
      label: labels.applicationsSection.label,
      labelKey: labels.applicationsSection.key,
      iconPath: iconNames.applications,
      order: 55,
      requiredRoles: applicationsRequiredRoles
    },
    { id: "admin", to: "/admin", label: labels.admin.label, labelKey: labels.admin.key, iconPath: iconNames.admin, order: 60, requiredRoles: ["admin", "superadmin"] },
    { id: "apps", to: "/apps", label: labels.appsSection.label, labelKey: labels.appsSection.key, iconPath: iconNames.apps, order: 75, requiredRoles: appsRequiredRoles },
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
        { id: "mod-users", label: labels.modUsers.label, labelKey: labels.modUsers.key, to: "/mod/users", requiredRoles: ["moderator", "admin", "superadmin"] }
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
        { id: "admin-dev-role-switcher", label: labels.devRoleSwitcher.label, labelKey: labels.devRoleSwitcher.key, to: "/admin/dev-role-switcher", requiredRoles: ["admin", "superadmin"] }
      ]
    },
    {
      id: "applications-main",
      railItemId: "applications",
      title: labels.applicationsSection.label,
      titleKey: labels.applicationsSection.key,
      order: 10,
      items: [
        { id: "applications-flows", label: labels.applicationsFlows.label, labelKey: labels.applicationsFlows.key, to: "/applications/flows", requiredRoles: applicationsRequiredRoles },
        { id: "applications-open", label: labels.applicationsOpen.label, labelKey: labels.applicationsOpen.key, to: "/applications/open", requiredRoles: applicationsRequiredRoles },
        { id: "applications-archive", label: labels.applicationsArchive.label, labelKey: labels.applicationsArchive.key, to: "/applications/archive", requiredRoles: applicationsRequiredRoles },
        { id: "applications-config", label: labels.applicationsConfig.label, labelKey: labels.applicationsConfig.key, to: "/applications/config", requiredRoles: ["admin", "superadmin"] }
      ]
    },
    {
      id: "apps-main",
      railItemId: "apps",
      title: labels.appsSection.label,
      titleKey: labels.appsSection.key,
      order: 10,
      items: [
        { id: "apps-overview", label: labels.appsOverview.label, labelKey: labels.appsOverview.key, to: "/apps/overview", requiredRoles: appsRequiredRoles },
        { id: "apps-sideload", label: labels.appsSideload.label, labelKey: labels.appsSideload.key, to: "/apps/sideload", requiredRoles: ["admin", "superadmin"] },
        { id: "apps-explore", label: labels.appsExplore.label, labelKey: labels.appsExplore.key, to: "/apps/explore", requiredRoles: appsRequiredRoles }
      ]
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
