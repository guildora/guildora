import type { createAppDb } from "../utils/app-db";

declare module "h3" {
  interface H3EventContext {
    guildora?: {
      userId: string;
      userRoles: string[];
      guildId: string | null;
      config: Record<string, unknown>;
      db: ReturnType<typeof createAppDb>;
    };
  }
}
