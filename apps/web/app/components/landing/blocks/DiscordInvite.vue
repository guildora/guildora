<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const { data: branding } = await useCommunityName();
const communityName = computed(() => branding.value?.communityName ?? undefined);
const inviteCode = computed(() => String(branding.value?.discordInviteCode || props.content.inviteCode || ""));
</script>

<template>
  <DiscordInviteWidget
    v-if="inviteCode"
    :invite-code="inviteCode"
    :fallback-heading="String(content.heading || '')"
    :fallback-description="String(content.description || '')"
    :community-name="communityName"
  />
</template>
