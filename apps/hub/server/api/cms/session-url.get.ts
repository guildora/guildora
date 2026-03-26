import { eq } from "drizzle-orm";
import { users } from "@guildora/shared";
import { requireSession } from "../../utils/auth";
import { loadCmsAccessConfig, hasCmsAccess } from "../../utils/cms-access";
import { createCmsSsoToken } from "../../utils/cms-sso";
import { getDb } from "../../utils/db";

function resolveCmsRole(permissionRoles: string[]): "admin" | "moderator" | null {
  if (permissionRoles.includes("superadmin") || permissionRoles.includes("admin")) {
    return "admin";
  }

  if (permissionRoles.includes("moderator")) {
    return "moderator";
  }

  return null;
}

export default defineEventHandler(async (event) => {
  const session = await requireSession(event);
  const config = useRuntimeConfig(event);
  const permissionRoles = session.user.permissionRoles ?? session.user.roles ?? [];
  const db = getDb();
  const cmsAccessConfig = await loadCmsAccessConfig(db);

  if (!hasCmsAccess(permissionRoles, cmsAccessConfig)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden."
    });
  }

  const cmsRole = resolveCmsRole(permissionRoles);
  if (!cmsRole) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden."
    });
  }

  const cmsUrl = String(config.public.cmsUrl || "").trim();
  if (!cmsUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: "CMS URL is not configured."
    });
  }

  const cmsSsoSecret = String(config.cmsSsoSecret || "");
  if (!cmsSsoSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: "CMS SSO is not configured."
    });
  }

  const [userRow] = await db
    .select({
      profileName: users.displayName
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const profileName = userRow?.profileName || session.user.profileName || "Member";
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = 60;
  const token = createCmsSsoToken(
    {
      sub: session.user.id,
      displayName: profileName,
      cmsRole,
      iat: now,
      exp: now + expiresInSeconds
    },
    cmsSsoSecret
  );

  let sessionUrl: URL;
  try {
    sessionUrl = new URL("/api/sso", cmsUrl);
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: "CMS URL is invalid."
    });
  }

  sessionUrl.searchParams.set("token", token);
  sessionUrl.searchParams.set("returnTo", "/admin");

  return {
    url: sessionUrl.toString(),
    expiresAt: new Date((now + expiresInSeconds) * 1000).toISOString()
  };
});
