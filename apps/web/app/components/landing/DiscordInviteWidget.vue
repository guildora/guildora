<script setup lang="ts">
const props = defineProps<{
  inviteCode: string;
  fallbackHeading?: string;
  fallbackDescription?: string;
  communityName?: string;
}>();

interface DiscordInvite {
  guild?: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
  };
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

const { data, status } = useFetch<DiscordInvite>(
  `https://discord.com/api/v9/invites/${props.inviteCode}?with_counts=true`,
  { server: false, lazy: true }
);

const inviteUrl = computed(() => `https://discord.gg/${props.inviteCode}`);

const iconUrl = computed(() => {
  const g = data.value?.guild;
  if (!g?.icon || !g?.id) return null;
  return `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`;
});

const serverName = computed(() => data.value?.guild?.name ?? props.fallbackHeading ?? "Discord");
const serverDescription = computed(() => data.value?.guild?.description ?? props.fallbackDescription ?? null);
const memberCount = computed(() => data.value?.approximate_member_count ?? null);
const onlineCount = computed(() => data.value?.approximate_presence_count ?? null);

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl bg-base-200 shadow-md">
    <!-- Header row: icon + name + join button -->
    <div class="flex items-center justify-between gap-4 px-6 py-6">
      <div class="flex items-center gap-4">
        <!-- Server icon or fallback -->
        <div class="relative h-14 w-14 shrink-0">
          <img
            v-if="iconUrl"
            :src="iconUrl"
            :alt="serverName"
            class="h-full w-full rounded-2xl object-cover shadow-sm"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center rounded-2xl bg-[#5865F2]/20 text-2xl shadow-sm"
          >
            💬
          </div>
        </div>

        <!-- Name + description -->
        <div>
          <p class="mb-0.5 text-xs font-semibold uppercase tracking-widest opacity-50">{{ props.communityName || $t("community.fallbackName") }}</p>
          <h3 class="text-xl font-extrabold leading-tight">{{ serverName }}</h3>
          <p v-if="serverDescription" class="mt-0.5 max-w-xs text-sm opacity-60">{{ serverDescription }}</p>
        </div>
      </div>

      <!-- Join button -->
      <a
        :href="inviteUrl"
        target="_blank"
        rel="noreferrer"
        class="btn btn-primary shrink-0 gap-2"
      >
        Join Discord
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 17L17 7M17 7H7M17 7v10"/>
        </svg>
      </a>
    </div>

    <!-- Stats row — only shown if Discord data loaded -->
    <div v-if="status === 'success' && (onlineCount !== null || memberCount !== null)" class="grid grid-cols-2 divide-x divide-base-300 border-t border-base-300">
      <!-- Online -->
      <div class="flex items-center gap-4 px-6 py-5">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/15">
          <span class="relative flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60"></span>
            <span class="relative inline-flex h-3 w-3 rounded-full bg-success"></span>
          </span>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest opacity-50">Online</p>
          <p class="text-2xl font-extrabold leading-tight">{{ onlineCount !== null ? formatCount(onlineCount) : "—" }}</p>
          <p class="text-xs opacity-50">currently active</p>
        </div>
      </div>

      <!-- Members -->
      <div class="flex items-center gap-4 px-6 py-5">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest opacity-50">Members</p>
          <p class="text-2xl font-extrabold leading-tight">{{ memberCount !== null ? formatCount(memberCount) : "—" }}</p>
          <p class="text-xs opacity-50">total</p>
        </div>
      </div>
    </div>

    <!-- Loading skeleton for stats -->
    <div v-else-if="status === 'pending'" class="grid grid-cols-2 divide-x divide-base-300 border-t border-base-300">
      <div v-for="n in 2" :key="n" class="flex items-center gap-4 px-6 py-5">
        <div class="h-10 w-10 animate-pulse rounded-xl bg-base-300" />
        <div class="space-y-2">
          <div class="h-2 w-12 animate-pulse rounded bg-base-300" />
          <div class="h-6 w-16 animate-pulse rounded bg-base-300" />
          <div class="h-2 w-20 animate-pulse rounded bg-base-300" />
        </div>
      </div>
    </div>
  </section>
</template>
