import { eq } from "drizzle-orm";
import { profiles } from "@newguildplus/shared";
import type { getDb } from "./db";

type DbClient = ReturnType<typeof getDb>;
type ProfileRow = typeof profiles.$inferSelect;

export type CommunityApplicationStatus = "open" | "approved" | "rejected";

export function getCommunityApplicationStatus(customFields: Record<string, unknown> | null | undefined): CommunityApplicationStatus {
  const rawStatus = customFields?.applicationStatus;
  if (rawStatus === "approved" || rawStatus === "rejected") {
    return rawStatus;
  }
  return "open";
}

export function buildReviewedApplicationCustomFields(
  customFields: Record<string, unknown> | null | undefined,
  status: "approved" | "rejected",
  reviewedByUserId: string,
  reviewedAtIso: string
) {
  return {
    ...(customFields || {}),
    applicationStatus: status,
    applicationReviewedAt: reviewedAtIso,
    applicationReviewedBy: reviewedByUserId
  };
}

export function buildOpenedApplicationCustomFields(
  customFields: Record<string, unknown> | null | undefined,
  submittedAtIso: string
) {
  return {
    ...(customFields || {}),
    applicationStatus: "open",
    applicationSubmittedAt: submittedAtIso,
    applicationReviewedAt: null,
    applicationReviewedBy: null
  };
}

export async function getProfileByUserId(db: DbClient, userId: string): Promise<ProfileRow | null> {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function ensureProfileByUserId(db: DbClient, userId: string): Promise<ProfileRow> {
  const existing = await getProfileByUserId(db, userId);
  if (existing) {
    return existing;
  }

  const insertedRows = await db
    .insert(profiles)
    .values({
      userId
    })
    .returning();
  const inserted = insertedRows[0];
  if (!inserted) {
    throw createError({ statusCode: 500, statusMessage: "Failed to create profile." });
  }
  return inserted;
}

export async function upsertProfileCustomFields(
  db: DbClient,
  userId: string,
  customFields: Record<string, unknown>
): Promise<ProfileRow> {
  const existing = await getProfileByUserId(db, userId);
  if (existing) {
    const updatedRows = await db
      .update(profiles)
      .set({
        customFields
      })
      .where(eq(profiles.userId, userId))
      .returning();
    const updated = updatedRows[0];
    if (!updated) {
      throw createError({ statusCode: 500, statusMessage: "Failed to update profile." });
    }
    return updated;
  }

  const insertedRows = await db
    .insert(profiles)
    .values({
      userId,
      customFields
    })
    .returning();
  const inserted = insertedRows[0];
  if (!inserted) {
    throw createError({ statusCode: 500, statusMessage: "Failed to create profile." });
  }
  return inserted;
}
