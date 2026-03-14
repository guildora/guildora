import { eq } from "drizzle-orm";
import { parseProfileName, profiles, users } from "@newguildplus/shared";
import { requireSession } from "../../utils/auth";
import { getDb } from "../../utils/db";
import { syncDiscordUserFromWebsite } from "../../utils/botSync";
import { buildEditableDiscordRolesForUser } from "../../utils/discord-roles";
import { readBodyWithSchema } from "../../utils/http";
import { jsonResponse, sanitizeForJson } from "../../utils/jsonResponse";
import { updateProfileSchema, updateUserDisplayName, upsertProfileDetails } from "../../utils/profile-write";
import {
  normalizeAppearancePreference,
  readAppearancePreferenceFromCustomFields,
  writeAppearancePreferenceToCustomFields
} from "../../../utils/appearance";
import {
  normalizeUserLocalePreference,
  readLegacyLocalePreferenceFromCustomFields,
  resolveEffectiveLocale
} from "../../../utils/locale-preference";
import { loadCommunitySettingsLocale } from "../../utils/community-settings";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const session = await requireSession(event);
  const parsed = await readBodyWithSchema(event, updateProfileSchema, "Invalid profile payload.");

  const profileName = await updateUserDisplayName(db, session.user.id, {
    ingameName: parsed.ingameName,
    rufname: parsed.rufname
  });
  const existingProfileRows = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).limit(1);
  const existingCustomFields = (existingProfileRows[0]?.customFields || {}) as Record<string, unknown>;
  const baseCustomFields = parsed.customFields ?? existingCustomFields;
  // Normalize custom fields to plain JSON-safe data to avoid Nitro serialization errors (e.g. value.toISOString is not a function).
  const normalizedCustomFields = sanitizeForJson(baseCustomFields) as Record<string, unknown>;
  const resolvedAppearancePreference = parsed.appearancePreference
    ? normalizeAppearancePreference(parsed.appearancePreference)
    : readAppearancePreferenceFromCustomFields(normalizedCustomFields);
  const resolvedLocalePreference = parsed.localePreference !== undefined
    ? normalizeUserLocalePreference(parsed.localePreference, null)
    : normalizeUserLocalePreference(
      existingProfileRows[0]?.localePreference ?? readLegacyLocalePreferenceFromCustomFields(normalizedCustomFields),
      null
    );
  const nextCustomFields = writeAppearancePreferenceToCustomFields(normalizedCustomFields, resolvedAppearancePreference);

  const updatedProfile = await upsertProfileDetails(
    db,
    session.user.id,
    {
      customFields: nextCustomFields,
      localePreference: resolvedLocalePreference
    },
    "self"
  );
  const updatedUser = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const userRow = updatedUser[0];
  const profileRow = updatedProfile.profileRow;
  let discordSync: {
    nicknameUpdated: boolean;
    nicknameReason: "not_requested" | "missing_permissions" | "member_not_manageable" | "nickname_too_long" | null;
    appliedNickname: string | null;
  } | null = null;

  if (userRow) {
    const syncResult = await syncDiscordUserFromWebsite({
      discordId: userRow.discordId,
      profileName: userRow.displayName
    });
    if (syncResult) {
      discordSync = {
        nicknameUpdated: syncResult.nicknameUpdated === true,
        nicknameReason: syncResult.nicknameReason ?? null,
        appliedNickname: syncResult.appliedNickname ?? null
      };
    }
  }

  const parsedName = parseProfileName(userRow?.displayName ?? profileName);
  const communityDefaultLocale = await loadCommunitySettingsLocale(db);

  const responseCustomFields = profileRow?.customFields ?? updatedProfile.customFields;
  const responseLocalePreference = normalizeUserLocalePreference(
    profileRow?.localePreference ?? updatedProfile.localePreference,
    null
  );
  const effectiveLocale = resolveEffectiveLocale({
    userLocalePreference: responseLocalePreference,
    communityDefaultLocale
  });
  const responseBody = {
    profileName: userRow?.displayName ?? profileName,
    ingameName: parsedName.ingameName,
    rufname: parsedName.rufname,
    appearancePreference: readAppearancePreferenceFromCustomFields(responseCustomFields),
    localePreference: responseLocalePreference,
    effectiveLocale: effectiveLocale.locale,
    localeSource: effectiveLocale.source,
    customFields: sanitizeForJson(responseCustomFields || {}),
    editableDiscordRoles: await buildEditableDiscordRolesForUser(session.user.id),
    discordSync
  };
  return jsonResponse(responseBody);
});
