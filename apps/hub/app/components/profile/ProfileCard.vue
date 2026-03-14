<script setup lang="ts">
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

defineProps<{
  profile: {
    profileName: string;
    ingameName: string;
    rufname: string | null;
    permissionRoles: string[];
    communityRole: string | null;
    voiceSummary?: {
      minutes7d: number;
      minutes14d: number;
      minutes28d: number;
      hours7d: number;
      label: string;
    };
  };
}>();
</script>

<template>
  <div class="space-y-2">
    <h2 class="text-xl font-semibold">{{ $t("profile.title") }}</h2>
    <p><strong>{{ $t("profile.profileName") }}:</strong> {{ profile.profileName || "-" }}</p>
    <p><strong>{{ $t("profile.ingameName") }}:</strong> {{ profile.ingameName || "-" }}</p>
    <p v-if="profile.rufname"><strong>{{ $t("profile.rufname") }}:</strong> {{ profile.rufname }}</p>
    <p><strong>{{ $t("profile.communityRole") }}:</strong> {{ profile.communityRole || "-" }}</p>
    <p><strong>{{ $t("profile.permissionRoles") }}:</strong> {{ profile.permissionRoles?.join(", ") || "-" }}</p>
    <p><strong>{{ $t("profile.voice7d") }}:</strong> {{ formatVoiceDuration(profile.voiceSummary?.minutes7d) }}</p>
  </div>
</template>
