import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { applicationFileUploads } from "@guildora/shared";
import { verifyAndLoadToken } from "../../../utils/application-tokens";
import { requireRouterParam } from "../../../utils/http";
import { getDb } from "../../../utils/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);

export default defineEventHandler(async (event) => {
  const flowId = requireRouterParam(event, "flowId", "Missing flow ID.");

  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: "No file uploaded." });
  }

  // Extract token from form data
  const tokenField = formData.find((f) => f.name === "token");
  const fileField = formData.find((f) => f.name === "file");

  if (!tokenField?.data) {
    throw createError({ statusCode: 400, statusMessage: "Missing token." });
  }
  if (!fileField?.data || !fileField.filename) {
    throw createError({ statusCode: 400, statusMessage: "Missing file." });
  }

  const token = tokenField.data.toString("utf8");
  const verified = await verifyAndLoadToken(token);
  if (!verified || verified.flowId !== flowId) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token." });
  }

  // Validate file
  const mimeType = fileField.type || "application/octet-stream";
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw createError({ statusCode: 400, statusMessage: `File type ${mimeType} is not allowed. Allowed: JPEG, PNG, PDF.` });
  }

  if (fileField.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: "File exceeds 5MB limit." });
  }

  // Store file
  const uploadDir = join(process.cwd(), "data", "application-uploads", flowId, verified.discordId);
  await mkdir(uploadDir, { recursive: true });

  const safeFilename = `${Date.now()}_${fileField.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storagePath = join(uploadDir, safeFilename);
  await writeFile(storagePath, fileField.data);

  // Insert DB record
  const db = getDb();
  const [upload] = await db.insert(applicationFileUploads).values({
    applicationId: null, // will be linked on submit
    discordId: verified.discordId,
    flowId,
    originalFilename: fileField.filename,
    mimeType,
    storagePath,
    fileSize: fileField.data.length
  }).returning();

  return {
    uploadId: upload.id,
    filename: fileField.filename,
    size: fileField.data.length
  };
});
