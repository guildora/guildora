import { z } from "zod";
import { defaultThemeColors, normalizeThemeColors, type ThemeContentTone } from "../../utils/theme-colors";

const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
const logoDataUrlRegex = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/;
const themeContentToneSchema = z.enum(["light", "dark"]);

export const themeColorsSchema = z.object({
  colorDominant: z.string().regex(hexColorRegex),
  colorSecondary: z.string().regex(hexColorRegex),
  colorAccent: z.string().regex(hexColorRegex),
  colorAccentContentTone: themeContentToneSchema,
  colorInfo: z.string().regex(hexColorRegex),
  colorInfoContentTone: themeContentToneSchema,
  colorSuccess: z.string().regex(hexColorRegex),
  colorSuccessContentTone: themeContentToneSchema,
  colorWarning: z.string().regex(hexColorRegex),
  colorWarningContentTone: themeContentToneSchema,
  colorError: z.string().regex(hexColorRegex),
  colorErrorContentTone: themeContentToneSchema
});

export const allowedThemeLogoMimeTypes = ["image/png", "image/webp", "image/svg+xml", "image/jpeg"] as const;
export const maxThemeLogoBytes = 1024 * 1024;

const sidebarLogoSizePxSchema = z.union([z.literal(40), z.literal(48), z.literal(60), z.literal(72)]);

export const themeAdminUpdateSchema = themeColorsSchema.extend({
  logoDataUrl: z.string().optional(),
  logoMimeType: z.string().optional(),
  logoFileName: z.string().min(1).max(180).optional(),
  removeLogo: z.boolean().optional(),
  sidebarLogoSizePx: sidebarLogoSizePxSchema.optional()
});

export type ThemeLogoPayload = {
  dataUrl: string;
  mimeType: string;
  fileName?: string;
};

export type AdminThemeResponse = z.infer<typeof themeColorsSchema> & {
  logo: ThemeLogoPayload | null;
  sidebarLogoSizePx: number;
};

const DEFAULT_SIDEBAR_LOGO_SIZE_PX = 60;

export function toAdminThemeResponse(input?: {
  colorDominant?: string;
  colorSecondary?: string;
  colorAccent?: string;
  colorAccentContentTone?: ThemeContentTone;
  colorInfo?: string;
  colorInfoContentTone?: ThemeContentTone;
  colorSuccess?: string;
  colorSuccessContentTone?: ThemeContentTone;
  colorWarning?: string;
  colorWarningContentTone?: ThemeContentTone;
  colorError?: string;
  colorErrorContentTone?: ThemeContentTone;
  logoDataUrl?: string | null;
  logoMimeType?: string | null;
  logoFileName?: string | null;
  sidebarLogoSizePx?: number | null;
}): AdminThemeResponse {
  const colors = normalizeThemeColors(input ?? {});
  const hasLogo = Boolean(input?.logoDataUrl && input?.logoMimeType);
  const size = input?.sidebarLogoSizePx ?? DEFAULT_SIDEBAR_LOGO_SIZE_PX;
  const sidebarLogoSizePx = [40, 48, 60, 72].includes(size) ? size : DEFAULT_SIDEBAR_LOGO_SIZE_PX;

  return {
    ...colors,
    logo: hasLogo
      ? {
          dataUrl: input?.logoDataUrl || "",
          mimeType: input?.logoMimeType || "",
          fileName: input?.logoFileName || undefined
        }
      : null,
    sidebarLogoSizePx
  };
}

export function parseThemeLogoUpdate(input: z.infer<typeof themeAdminUpdateSchema>): {
  removeLogo: boolean;
  logo: ThemeLogoPayload | null;
} {
  const wantsRemoval = input.removeLogo === true;
  const hasLogoFields = Boolean(input.logoDataUrl || input.logoMimeType || input.logoFileName);

  if (wantsRemoval && hasLogoFields) {
    throw new Error("removeLogo cannot be combined with logo upload fields.");
  }

  if (!hasLogoFields) {
    return { removeLogo: wantsRemoval, logo: null };
  }

  if (!input.logoDataUrl || !input.logoMimeType) {
    throw new Error("logoDataUrl and logoMimeType are required for logo uploads.");
  }

  if (!allowedThemeLogoMimeTypes.includes(input.logoMimeType as (typeof allowedThemeLogoMimeTypes)[number])) {
    throw new Error("Unsupported logo MIME type.");
  }

  const match = input.logoDataUrl.match(logoDataUrlRegex);
  if (!match) {
    throw new Error("Invalid logo data URL format.");
  }

  const mimeFromDataUrl = match[1]?.toLowerCase();
  const base64Payload = match[2];
  if (!mimeFromDataUrl || !base64Payload) {
    throw new Error("Invalid logo data URL format.");
  }

  if (mimeFromDataUrl !== input.logoMimeType.toLowerCase()) {
    throw new Error("logoMimeType does not match the data URL MIME type.");
  }

  let decodedBytes = 0;
  try {
    decodedBytes = Buffer.from(base64Payload, "base64").byteLength;
  } catch {
    throw new Error("Invalid base64 payload in logo data URL.");
  }

  if (decodedBytes <= 0) {
    throw new Error("Logo payload is empty.");
  }

  if (decodedBytes > maxThemeLogoBytes) {
    throw new Error("Logo file exceeds the maximum size of 1 MB.");
  }

  return {
    removeLogo: false,
    logo: {
      dataUrl: input.logoDataUrl,
      mimeType: input.logoMimeType,
      fileName: input.logoFileName
    }
  };
}

export { defaultThemeColors, normalizeThemeColors };
