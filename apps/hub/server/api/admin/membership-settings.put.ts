import { z } from "zod";
import { eq } from "drizzle-orm";
import { membershipSettings } from "@guildora/shared";
import { requireAdminSession } from "../../utils/auth";
import { getDb } from "../../utils/db";
import { readBodyWithSchema } from "../../utils/http";
import { MEMBERSHIP_SETTINGS_SINGLETON_ID, invalidateMembershipSettingsCache } from "../../utils/membership-settings";

const cleanupConditionSchema = z.object({
  type: z.enum(["orphan", "missingRole", "loginInactive", "voiceInactive"]),
  operator: z.enum(["AND", "OR"])
});

const roleCleanupConfigSchema = z.object({
  permissionRoleName: z.string(),
  enabled: z.boolean(),
  conditions: z.array(cleanupConditionSchema),
  cleanupRequiredRoleId: z.string().nullable().optional(),
  cleanupInactiveDays: z.number().int().positive().nullable().optional(),
  cleanupNoVoiceDays: z.number().int().positive().nullable().optional()
});

const schema = z.object({
  applicationsRequired: z.boolean().optional(),
  defaultCommunityRoleId: z.number().int().positive().nullable().optional(),
  requiredLoginRoleId: z.string().nullable().optional(),
  autoSyncEnabled: z.boolean().optional(),
  autoSyncIntervalHours: z.number().int().min(1).max(720).optional(),
  autoCleanupEnabled: z.boolean().optional(),
  autoCleanupIntervalHours: z.number().int().min(1).max(720).optional(),
  cleanupRoleConfigs: z.array(roleCleanupConfigSchema).optional(),
  cleanupRoleWhitelist: z.array(z.string()).optional(),
  cleanupProtectModerators: z.boolean().optional()
});

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const parsed = await readBodyWithSchema(event, schema, "Invalid membership settings payload.");

  // Validate constraint: if applications disabled, default role must be set
  if (parsed.applicationsRequired === false && parsed.defaultCommunityRoleId === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "A default community role must be configured when applications are disabled."
    });
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(membershipSettings)
    .where(eq(membershipSettings.id, MEMBERSHIP_SETTINGS_SINGLETON_ID))
    .limit(1);

  if (
    parsed.applicationsRequired === false &&
    parsed.defaultCommunityRoleId === null &&
    !existing?.defaultCommunityRoleId
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "A default community role must be configured when applications are disabled."
    });
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    updatedBy: session.user.id
  };

  if (parsed.applicationsRequired !== undefined) updateData.applicationsRequired = parsed.applicationsRequired;
  if (parsed.defaultCommunityRoleId !== undefined) updateData.defaultCommunityRoleId = parsed.defaultCommunityRoleId;
  if (parsed.requiredLoginRoleId !== undefined) updateData.requiredLoginRoleId = parsed.requiredLoginRoleId;
  if (parsed.autoSyncEnabled !== undefined) updateData.autoSyncEnabled = parsed.autoSyncEnabled;
  if (parsed.autoSyncIntervalHours !== undefined) updateData.autoSyncIntervalHours = parsed.autoSyncIntervalHours;
  if (parsed.autoCleanupEnabled !== undefined) updateData.autoCleanupEnabled = parsed.autoCleanupEnabled;
  if (parsed.autoCleanupIntervalHours !== undefined) updateData.autoCleanupIntervalHours = parsed.autoCleanupIntervalHours;
  if (parsed.cleanupRoleConfigs !== undefined) updateData.cleanupRoleConfigs = parsed.cleanupRoleConfigs;
  if (parsed.cleanupRoleWhitelist !== undefined) updateData.cleanupRoleWhitelist = parsed.cleanupRoleWhitelist;
  if (parsed.cleanupProtectModerators !== undefined) updateData.cleanupProtectModerators = parsed.cleanupProtectModerators;

  if (existing) {
    await db
      .update(membershipSettings)
      .set(updateData)
      .where(eq(membershipSettings.id, MEMBERSHIP_SETTINGS_SINGLETON_ID));
  } else {
    await db.insert(membershipSettings).values({
      id: MEMBERSHIP_SETTINGS_SINGLETON_ID,
      ...updateData
    });
  }

  invalidateMembershipSettingsCache();

  return { ok: true };
});
