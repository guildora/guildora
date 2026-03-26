import type { RuntimeInstalledApp } from "../../../plugins/app-loader";
import { requireSession } from "../../../utils/auth";
import { resolveAppLocaleMessages } from "../../../utils/app-messages";

const supportedLocales = new Set(["de", "en"]);

export default defineEventHandler(async (event) => {
  await requireSession(event);

  const appId = getRouterParam(event, "appId");
  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: "Missing appId." });
  }

  const query = getQuery(event) as { locale?: string };
  const locale = query.locale?.toLowerCase();
  if (!locale || !supportedLocales.has(locale)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid locale. Expected 'de' or 'en'." });
  }

  const apps: RuntimeInstalledApp[] = event.context.installedApps || [];
  const app = apps.find((candidate) => candidate.appId === appId);
  if (!app) {
    throw createError({ statusCode: 404, statusMessage: `App '${appId}' not found.` });
  }

  return resolveAppLocaleMessages(app.codeBundle || {}, locale as "de" | "en");
});
