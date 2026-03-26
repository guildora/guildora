import { createLinearIssue } from "../utils/linear";

const TEAM_ID = "4237c0a2-eb28-4c3d-9a89-1afc8a0b5e3f";
const FEEDBACK_PROJECT_ID = "0c2431f3-5813-4597-b9ff-f64af10141b3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  if (!config.linearApiKey) {
    throw createError({ statusCode: 500, message: "Linear API key not configured" });
  }

  const body = await readBody(event);
  const { title, category, description } = body ?? {};

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Title is required" });
  }
  if (!category || typeof category !== "string" || category.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Category is required" });
  }
  if (!description || typeof description !== "string" || description.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Description is required" });
  }
  if (title.length > 150) {
    throw createError({ statusCode: 400, message: "Title is too long" });
  }
  if (description.length > 5000) {
    throw createError({ statusCode: 400, message: "Description is too long" });
  }

  const issueTitle = `[Feedback] ${title.trim()}`;
  const issueDescription = `**Category:** ${category.trim()}\n\n${description.trim()}`;

  try {
    await createLinearIssue({
      apiKey: config.linearApiKey,
      teamId: TEAM_ID,
      projectId: FEEDBACK_PROJECT_ID,
      title: issueTitle,
      description: issueDescription
    });
  } catch {
    throw createError({ statusCode: 500, message: "Failed to create feedback" });
  }

  return { success: true };
});
