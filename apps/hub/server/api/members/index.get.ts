import {
  parseProfileName,
  users,
  voiceSessions
} from "@guildora/shared";
import { requireSession } from "../../utils/auth";
import { getDb } from "../../utils/db";
import { loadUserCommunityRolesMap, loadUserPermissionRolesMap } from "../../utils/user-directory";
import { calculateVoiceMinutesFromSessions, classifyVoiceActivity, formatMinutesToHours } from "../../utils/voice";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const db = getDb();

  const query = getQuery(event);
  const search = typeof query.search === "string" ? query.search.toLowerCase() : "";
  const roleFilter = typeof query.communityRole === "string" ? query.communityRole : "";
  const sort = typeof query.sort === "string" ? query.sort : "name";
  const voiceActivityDays = Number.parseInt(typeof query.voiceActivityDays === "string" ? query.voiceActivityDays : "7", 10);
  const days = [7, 14, 28].includes(voiceActivityDays) ? voiceActivityDays : 7;

  const [userRows, communityMap, permissionsMap, sessions] = await Promise.all([
    db.select().from(users),
    loadUserCommunityRolesMap(db),
    loadUserPermissionRolesMap(db),
    db
      .select({
        userId: voiceSessions.userId,
        startedAt: voiceSessions.startedAt,
        endedAt: voiceSessions.endedAt,
        durationMinutes: voiceSessions.durationMinutes
      })
      .from(voiceSessions)
  ]);

  const voiceMap = new Map<string, Array<{ startedAt: Date; endedAt: Date | null; durationMinutes: number | null }>>();
  for (const session of sessions) {
    const list = voiceMap.get(session.userId) || [];
    list.push(session);
    voiceMap.set(session.userId, list);
  }

  let items = userRows.map((user) => {
    const userSessions = voiceMap.get(user.id) || [];
    const minutes = calculateVoiceMinutesFromSessions(userSessions, days);
    const hours = formatMinutesToHours(minutes);
    return {
      id: user.id,
      discordId: user.discordId,
      profileName: user.displayName,
      ...parseProfileName(user.displayName),
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      communityRole: communityMap.get(user.id)?.name ?? null,
      permissionRoles: permissionsMap.get(user.id) || [],
      voice: {
        minutes,
        hours,
        label: classifyVoiceActivity(hours)
      }
    };
  });

  if (search) {
    items = items.filter((item) => {
      const value = `${item.profileName} ${item.ingameName} ${item.rufname || ""} ${item.discordId}`.toLowerCase();
      return value.includes(search);
    });
  }

  if (roleFilter) {
    items = items.filter((item) => item.communityRole === roleFilter);
  }

  if (sort === "joined") {
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else if (sort === "role") {
    items.sort((a, b) => (a.communityRole || "").localeCompare(b.communityRole || ""));
  } else if (sort === "voice") {
    items.sort((a, b) => b.voice.minutes - a.voice.minutes);
  } else {
    items.sort((a, b) => a.profileName.localeCompare(b.profileName));
  }

  return {
    days,
    items
  };
});
