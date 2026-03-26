export function useCommunityName() {
  const config = useRuntimeConfig();
  const hubUrl = String(config.public.hubUrl || "").trim() || "http://localhost:3003";

  return useAsyncData("community-name", async () => {
    try {
      const result = await $fetch<{ communityName: string | null; discordInviteCode: string | null }>(
        `${hubUrl}/api/public/branding`
      );
      return result;
    } catch {
      return { communityName: null, discordInviteCode: null };
    }
  });
}
