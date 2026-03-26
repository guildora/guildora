type SyncUserPayload = {
  discordId: string;
  profileName?: string | null;
  permissionRoles?: string[];
};

export type BotInternalErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_JSON_BODY"
  | "MISSING_DISCORD_ID"
  | "MISSING_ROLE_ID"
  | "MISSING_ROLE_IDS"
  | "INVALID_SELECTED_ROLE_IDS"
  | "NON_EDITABLE_ALLOWED_ROLES"
  | "NOT_FOUND"
  | "REQUEST_BODY_TOO_LARGE"
  | "SYNC_FAILED";

export type DiscordUserSyncResult = {
  ok: boolean;
  nicknameUpdated?: boolean;
  nicknameReason?: "not_requested" | "missing_permissions" | "member_not_manageable" | "nickname_too_long" | null;
  appliedNickname?: string | null;
};

type RemoveRolesPayload = {
  roleIds?: string[];
  removeAllManageable?: boolean;
};

type SyncCommunityRolesPayload = {
  allowedRoleIds: string[];
  selectedRoleIds: string[];
};

export type DiscordGuildRole = {
  id: string;
  name: string;
  position: number;
  managed: boolean;
  editable: boolean;
};

export type DiscordGuildMember = {
  discordId: string;
  displayName: string;
  nickname: string | null;
  avatarUrl: string | null;
  roleIds: string[];
};

export class BotBridgeError extends Error {
  readonly code: BotInternalErrorCode | "UNKNOWN";
  readonly statusCode?: number;

  constructor(code: BotInternalErrorCode | "UNKNOWN", message: string, statusCode?: number) {
    super(message);
    this.name = "BotBridgeError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function getBotRequestConfig() {
  const runtime = useRuntimeConfig();
  const baseUrl = typeof runtime.botInternalUrl === "string" ? runtime.botInternalUrl : "";
  const token = typeof runtime.botInternalToken === "string" ? runtime.botInternalToken : "";
  return { baseUrl, token };
}

async function requestBotInternal<T>(path: string, options?: { method?: "GET" | "POST"; body?: unknown }) {
  const { baseUrl, token } = getBotRequestConfig();
  if (!baseUrl) {
    throw new Error("BOT_INTERNAL_URL is not configured.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token.length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    return await $fetch<T>(`${baseUrl}${path}`, {
      method: options?.method || "GET",
      headers,
      body: (options?.body ?? undefined) as Record<string, unknown> | undefined
    });
  } catch (error) {
    const maybeError = error as {
      statusCode?: number;
      data?: {
        errorCode?: BotInternalErrorCode;
        error?: string;
      };
      message?: string;
    };

    const errorCode = maybeError?.data?.errorCode;
    if (errorCode) {
      throw new BotBridgeError(
        errorCode,
        maybeError.data?.error || maybeError.message || "Bot bridge request failed.",
        maybeError.statusCode
      );
    }

    throw new BotBridgeError("UNKNOWN", maybeError?.message || "Bot bridge request failed.", maybeError?.statusCode);
  }
}

export async function syncDiscordUserFromWebsite(payload: SyncUserPayload): Promise<DiscordUserSyncResult | null> {
  const { baseUrl } = getBotRequestConfig();
  if (!baseUrl) {
    return null;
  }

  try {
    return await requestBotInternal<DiscordUserSyncResult>("/internal/sync-user", { method: "POST", body: payload });
  } catch (error) {
    console.error("Bot sync failed:", error);
    return null;
  }
}

export async function fetchDiscordGuildRolesFromBot() {
  return requestBotInternal<{ roles: DiscordGuildRole[] }>("/internal/guild/roles");
}

export async function fetchDiscordGuildMembersByRoleFromBot(roleId: string) {
  const encodedRoleId = encodeURIComponent(roleId);
  return requestBotInternal<{ members: DiscordGuildMember[] }>(`/internal/guild/roles/${encodedRoleId}/members`);
}

export async function fetchDiscordGuildMemberFromBot(discordId: string) {
  const encodedDiscordId = encodeURIComponent(discordId);
  return requestBotInternal<{ member: DiscordGuildMember | null }>(`/internal/guild/members/${encodedDiscordId}`);
}

export async function removeDiscordRolesFromBot(discordId: string, payload: RemoveRolesPayload) {
  const encodedDiscordId = encodeURIComponent(discordId);
  return requestBotInternal<{ ok: boolean; removedRoleIds: string[] }>(`/internal/guild/members/${encodedDiscordId}/remove-roles`, {
    method: "POST",
    body: payload
  });
}

export async function refreshBotCommands(): Promise<void> {
  const { baseUrl } = getBotRequestConfig();
  if (!baseUrl) return;
  await requestBotInternal<{ ok: boolean }>("/internal/sync-commands", { method: "POST" });
}

export async function syncDiscordCommunityRolesFromBot(discordId: string, payload: SyncCommunityRolesPayload) {
  const encodedDiscordId = encodeURIComponent(discordId);
  return requestBotInternal<{ ok: boolean; addedRoleIds: string[]; removedRoleIds: string[]; currentRoleIds: string[] }>(
    `/internal/guild/members/${encodedDiscordId}/sync-community-roles`,
    {
      method: "POST",
      body: payload
    }
  );
}
