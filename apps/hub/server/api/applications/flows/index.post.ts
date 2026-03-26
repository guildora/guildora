import { z } from "zod";
import { applicationFlows } from "@guildora/shared";
import { createDefaultFlowGraph, createDefaultFlowSettings } from "@guildora/shared";
import { requireModeratorSession } from "../../../utils/auth";
import { readBodyWithSchema } from "../../../utils/http";
import { getDb } from "../../../utils/db";

const createFlowSchema = z.object({
  name: z.string().min(1).max(200)
});

export default defineEventHandler(async (event) => {
  const session = await requireModeratorSession(event);
  const body = await readBodyWithSchema(event, createFlowSchema, "Invalid flow name.");
  const db = getDb();

  const [flow] = await db
    .insert(applicationFlows)
    .values({
      name: body.name,
      status: "draft",
      flowJson: createDefaultFlowGraph(),
      settingsJson: createDefaultFlowSettings(),
      createdBy: session.user.id
    })
    .returning();

  return { flow };
});
