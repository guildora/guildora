import type { AppSession } from "./auth";

const moderatorRoles = ["moderator", "admin", "superadmin"] as const;

export function isDevRoleSwitcherEnabled(event: Parameters<typeof useRuntimeConfig>[0]) {
  const config = useRuntimeConfig(event);
  return import.meta.dev || process.env.NODE_ENV === "development" || Boolean(config.public.enablePerformanceDebug);
}

export function canUseDevRoleSwitcher(session: AppSession) {
  const roles = session.user.permissionRoles ?? session.user.roles ?? [];
  return Boolean(session.originalUserId) || moderatorRoles.some((role) => roles.includes(role));
}

export function assertDevRoleSwitcherAccess(event: Parameters<typeof useRuntimeConfig>[0], session: AppSession) {
  if (!isDevRoleSwitcherEnabled(event)) {
    throw createError({
      statusCode: 403,
      statusMessage: "This endpoint is only available in development mode."
    });
  }

  if (!canUseDevRoleSwitcher(session)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden."
    });
  }
}

export function hasModeratorAccess(roles: string[]) {
  return moderatorRoles.some((role) => roles.includes(role));
}
