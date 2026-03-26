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

const props = defineProps<{
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
  <div class="profile-card">
    <!-- Identity Section -->
    <div class="profile-card__section">
      <div class="profile-card__identity">
        <h3 class="profile-card__name">{{ profile.profileName }}</h3>
        <p class="profile-card__subtitle">
          {{ profile.ingameName }}
          <span v-if="profile.rufname" class="profile-card__rufname">&middot; {{ profile.rufname }}</span>
        </p>
      </div>
    </div>

    <!-- Roles Section -->
    <div class="profile-card__section">
      <span class="profile-card__section-title">{{ $t("profile.rolesSection") }}</span>
      <div class="profile-card__roles">
        <span v-if="profile.communityRole" class="badge badge-primary badge-sm">{{ profile.communityRole }}</span>
        <template v-if="profile.permissionRoles?.length">
          <span v-for="role in profile.permissionRoles" :key="role" class="badge badge-ghost badge-sm">{{ role }}</span>
        </template>
        <span v-if="!profile.communityRole && !profile.permissionRoles?.length" class="profile-card__no-roles">
          {{ $t("profile.noRoles") }}
        </span>
      </div>
    </div>

    <!-- Voice Activity Section -->
    <div class="profile-card__section profile-card__section--last">
      <span class="profile-card__section-title">{{ $t("profile.voiceSection") }}</span>
      <div class="profile-card__voice-stats">
        <div class="profile-card__voice-row">
          <span class="profile-card__voice-label">{{ $t("profile.voice7d") }}</span>
          <span class="profile-card__voice-value">{{ formatVoiceDuration(profile.voiceSummary?.minutes7d) }}</span>
        </div>
        <div class="profile-card__voice-row">
          <span class="profile-card__voice-label">{{ $t("profile.voice14d") }}</span>
          <span class="profile-card__voice-value">{{ formatVoiceDuration(profile.voiceSummary?.minutes14d) }}</span>
        </div>
        <div class="profile-card__voice-row">
          <span class="profile-card__voice-label">{{ $t("profile.voice28d") }}</span>
          <span class="profile-card__voice-value">{{ formatVoiceDuration(profile.voiceSummary?.minutes28d) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
}

.profile-card__section {
  padding-block: var(--space-4);
  border-bottom: 1px solid var(--color-line);
}

.profile-card__section--last {
  border-bottom: none;
  padding-bottom: 0;
}

.profile-card__section:first-child {
  padding-top: 0;
}

.profile-card__section-title {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-3);
}

.profile-card__identity {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.profile-card__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.profile-card__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.profile-card__rufname {
  color: var(--color-text-tertiary);
}

.profile-card__roles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.profile-card__no-roles {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.profile-card__voice-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.profile-card__voice-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.profile-card__voice-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.profile-card__voice-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  flex-shrink: 0;
  text-align: right;
}

</style>
