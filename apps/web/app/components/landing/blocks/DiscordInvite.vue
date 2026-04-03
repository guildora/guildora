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
  <div v-if="inviteCode" class="py-16 md:py-24">
    <DiscordInviteWidget
      :invite-code="inviteCode"
      :fallback-heading="String(content.heading || '')"
      :fallback-description="String(content.description || '')"
      :community-name="communityName"
    />
  </div>
</template>
