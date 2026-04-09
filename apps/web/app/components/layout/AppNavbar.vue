<script setup lang="ts">
const props = defineProps<{ communityName?: string; discordInviteCode?: string }>();
const { t } = useI18n();
const localePath = useLocalePath();

const discordInviteUrl = computed(() =>
  props.discordInviteCode ? `https://discord.gg/${props.discordInviteCode}` : null
);
</script>

<template>
  <div class="bg-base-100 px-3 py-3 md:px-5">
    <div class="navbar mx-auto max-w-[1400px] rounded-2xl bg-base-100/95 px-3 shadow-sm md:px-4">
      <div class="navbar-start">
        <NuxtLink to="/" class="btn btn-ghost text-lg font-semibold tracking-wide">{{ props.communityName || $t("app.name") }}</NuxtLink>
      </div>
      <div class="navbar-end gap-2">
        <a
          v-if="discordInviteUrl"
          :href="discordInviteUrl"
          target="_blank"
          rel="noreferrer"
          class="btn btn-sm btn-primary gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          {{ t("nav.joinDiscord") }}
        </a>
        <NuxtLink
          :to="localePath('/login')"
          class="flex items-center opacity-60 hover:opacity-100 transition-opacity"
          :title="t('nav.login')"
          :aria-label="t('nav.login')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
