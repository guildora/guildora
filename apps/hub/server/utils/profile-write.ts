import { eq, sql } from "drizzle-orm";
import { profiles, serializeProfileName, users } from "@newguildplus/shared";
import { z } from "zod";
import { appearancePreferences } from "../../utils/appearance";
import { localePreferences } from "../../utils/locale-preference";
import type { getDb } from "./db";

const profileNameSchema = z.object({
  ingameName: z.string().trim().min(1).max(60).refine((value) => !value.includes("|")),
  rufname: z.string().trim().max(60).refine((value) => !value.includes("|")).nullable()
});

export const updateProfileSchema = profileNameSchema.extend({
  appearancePreference: z.enum(appearancePreferences).optional(),
  localePreference: z.enum(localePreferences).nullable().optional(),
  customFields: z.record(z.unknown()).optional()
});

export const updateModProfileSchema = profileNameSchema;

type DbClient = ReturnType<typeof getDb>;
type ProfileUpdateMode = "self" | "moderation";

type ProfileDetailsInput = {
  customFields?: Record<string, unknown>;
  localePreference?: z.output<(typeof updateProfileSchema)["shape"]["localePreference"]>;
};

export async function updateUserDisplayName(
  db: DbClient,
  userId: string,
  profileNameInput: z.output<typeof profileNameSchema>
) {
  const profileName = serializeProfileName(profileNameInput);
  await db
    .update(users)
    .set({
      displayName: profileName,
      updatedAt: sql`now()`
    })
    .where(eq(users.id, userId));
  return profileName;
}

export async function upsertProfileDetails(
  db: DbClient,
  userId: string,
  input: ProfileDetailsInput,
  mode: ProfileUpdateMode
) {
  const existingProfileRows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  const existingProfile = existingProfileRows[0] ?? null;

  const currentCustomFields = (existingProfile?.customFields || {}) as Record<string, unknown>;
  const nextCustomFields = mode === "self" ? input.customFields ?? currentCustomFields : currentCustomFields;
  const nextLocalePreference = mode === "self" ? input.localePreference ?? existingProfile?.localePreference ?? null : existingProfile?.localePreference ?? null;

  if (!existingProfile) {
    await db.insert(profiles).values({
      userId,
      customFields: mode === "self" ? nextCustomFields : {},
      localePreference: mode === "self" ? nextLocalePreference : null,
      updatedAt: sql`now()`
    });
  } else if (mode === "self") {
    await db
      .update(profiles)
      .set({
        customFields: nextCustomFields,
        localePreference: nextLocalePreference,
        updatedAt: sql`now()`
      })
      .where(eq(profiles.userId, userId));
  }

  const updatedProfileRows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  const profileRow = updatedProfileRows[0] ?? null;

  return {
    profileRow,
    customFields: nextCustomFields,
    localePreference: nextLocalePreference
  };
}
