import { desc, eq } from "drizzle-orm";
import { themeSettings } from "@guildora/shared";
import { requireAdminSession } from "../../utils/auth";
import { getDb } from "../../utils/db";
import { readBodyWithSchema } from "../../utils/http";
import { normalizeThemeColors, parseThemeLogoUpdate, themeAdminUpdateSchema, toAdminThemeResponse } from "../../utils/theme";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const session = await requireAdminSession(event);
  const parsed = await readBodyWithSchema(event, themeAdminUpdateSchema, "Invalid theme payload.");

  const normalized = normalizeThemeColors(parsed);
  let parsedLogo;
  try {
    parsedLogo = parseThemeLogoUpdate(parsed);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : "Invalid logo payload."
    });
  }
  const sidebarLogoSizePx = [40, 48, 60, 72].includes(Number(parsed.sidebarLogoSizePx))
    ? Number(parsed.sidebarLogoSizePx)
    : undefined;

  const [existingTheme] = await db.select().from(themeSettings).orderBy(desc(themeSettings.updatedAt)).limit(1);

  if (existingTheme) {
    await db
      .update(themeSettings)
      .set({
        colorDominant: normalized.colorDominant,
        colorSecondary: normalized.colorSecondary,
        colorAccent: normalized.colorAccent,
        colorAccentContentTone: normalized.colorAccentContentTone,
        colorInfo: normalized.colorInfo,
        colorInfoContentTone: normalized.colorInfoContentTone,
        colorSuccess: normalized.colorSuccess,
        colorSuccessContentTone: normalized.colorSuccessContentTone,
        colorWarning: normalized.colorWarning,
        colorWarningContentTone: normalized.colorWarningContentTone,
        colorError: normalized.colorError,
        colorErrorContentTone: normalized.colorErrorContentTone,
        logoDataUrl: parsedLogo.removeLogo ? null : parsedLogo.logo?.dataUrl ?? existingTheme.logoDataUrl,
        logoMimeType: parsedLogo.removeLogo ? null : parsedLogo.logo?.mimeType ?? existingTheme.logoMimeType,
        logoFileName: parsedLogo.removeLogo ? null : parsedLogo.logo?.fileName ?? existingTheme.logoFileName,
        ...(sidebarLogoSizePx !== undefined && { sidebarLogoSizePx }),
        updatedAt: new Date(),
        updatedBy: session.user.id
      })
      .where(eq(themeSettings.id, existingTheme.id));
  } else {
    await db.insert(themeSettings).values({
      colorDominant: normalized.colorDominant,
      colorSecondary: normalized.colorSecondary,
      colorAccent: normalized.colorAccent,
      colorAccentContentTone: normalized.colorAccentContentTone,
      colorInfo: normalized.colorInfo,
      colorInfoContentTone: normalized.colorInfoContentTone,
      colorSuccess: normalized.colorSuccess,
      colorSuccessContentTone: normalized.colorSuccessContentTone,
      colorWarning: normalized.colorWarning,
      colorWarningContentTone: normalized.colorWarningContentTone,
      colorError: normalized.colorError,
      colorErrorContentTone: normalized.colorErrorContentTone,
      logoDataUrl: parsedLogo.logo?.dataUrl ?? null,
      logoMimeType: parsedLogo.logo?.mimeType ?? null,
      logoFileName: parsedLogo.logo?.fileName ?? null,
      sidebarLogoSizePx: sidebarLogoSizePx ?? 60,
      updatedBy: session.user.id
    });
  }

  const [storedTheme] = await db.select().from(themeSettings).orderBy(desc(themeSettings.updatedAt)).limit(1);
  return toAdminThemeResponse(storedTheme ?? normalized);
});
