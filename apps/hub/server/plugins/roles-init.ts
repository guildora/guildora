import { ensureDefaultRoles } from "../utils/community";

export default defineNitroPlugin(async () => {
  try {
    await ensureDefaultRoles();
  } catch (error) {
    console.error("Failed to ensure default roles on startup:", error);
  }
});
