<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const localePath = useLocalePath();
const { t } = useI18n();

function formatVoiceDuration(minutes: number | null | undefined) {
  if (!Number.isFinite(minutes) || (minutes || 0) <= 0) {
    return "0";
  }

  const totalMinutes = Math.round(minutes as number);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return t("profile.voiceDuration", { hours, minutes: remainingMinutes });
}

interface MemberItem {
  id: string;
  profileName: string;
  ingameName: string;
  rufname: string | null;
  communityRole: string | null;
  voice: {
    label: string;
    minutes: number;
    hours: number;
  };
}

interface MembersResponse {
  days: number;
  items: MemberItem[];
}

const search = ref("");
const communityRole = ref("");
const sort = ref("name");

const { data, pending, error } = await useFetch<MembersResponse>("/api/members", {
  query: computed(() => ({
    search: search.value || undefined,
    communityRole: communityRole.value || undefined,
    voiceActivityDays: 7,
    sort: sort.value
  }))
});

const roleOptions = computed(() => {
  const values = new Set<string>();
  for (const item of data.value?.items || []) {
    if (item.communityRole) {
      values.add(item.communityRole);
    }
  }
  return Array.from(values).sort();
});
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("members.title") }}</h1>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <UiRetroInput
        v-model="search"
        :label="$t('members.searchPlaceholder')"
        :placeholder="$t('members.searchPlaceholder')"
       
      />
      <UiRetroSelect v-model="communityRole" :label="$t('members.allRoles')">
        <option value="">{{ $t("members.allRoles") }}</option>
        <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
      </UiRetroSelect>
      <UiRetroSelect v-model="sort" :label="$t('members.sortLabel')">
        <option value="name">{{ $t("members.sortName") }}</option>
        <option value="joined">{{ $t("members.sortJoined") }}</option>
        <option value="role">{{ $t("members.sortRole") }}</option>
        <option value="voice">{{ $t("members.sortVoice") }}</option>
      </UiRetroSelect>
    </div>

    <div v-if="pending" class="loading loading-spinner loading-md" />
    <div v-else-if="error" class="alert alert-error">{{ $t("common.error") }}</div>
    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in data?.items || []" :key="item.id" class="card bg-base-200">
        <div class="card-body">
          <div class="flex items-start justify-between gap-3">
            <h2 class="card-title">{{ item.profileName }}</h2>
          </div>
          <p><strong>{{ $t("profile.communityRole") }}:</strong> {{ item.communityRole || "-" }}</p>
          <p><strong>{{ $t("profile.voice7d") }}:</strong> {{ formatVoiceDuration(item.voice.minutes) }}</p>
          <div class="card-actions justify-end">
            <NuxtLink class="btn btn-primary btn-sm" :to="localePath(`/members/${item.id}`)">{{ $t("members.viewProfile") }}</NuxtLink>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
