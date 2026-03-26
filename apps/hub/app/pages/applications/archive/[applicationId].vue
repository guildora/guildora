<script setup lang="ts">
import type { ApplicationFlowGraph } from "@guildora/shared";
import { linearizeFlowGraph } from "@guildora/shared";

definePageMeta({
  middleware: ["moderator"],
});

const route = useRoute();
const applicationId = route.params.applicationId as string;
const { t } = useI18n();

type ApplicationDetail = {
  application: {
    id: string;
    discordId: string;
    discordUsername: string;
    discordAvatarUrl: string | null;
    answersJson: Record<string, unknown>;
    status: string;
    rolesAssigned: string[] | null;
    displayNameComposed: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    createdAt: string;
  };
  flow: {
    id: string;
    name: string;
    flowJson: ApplicationFlowGraph;
  } | null;
  previousApplications: unknown[];
};

const { data, pending, error } = await useFetch<ApplicationDetail>(
  `/api/applications/${applicationId}`
);

const linearized = computed(() => {
  if (!data.value?.flow?.flowJson || !data.value?.application?.answersJson) return null;
  return linearizeFlowGraph(data.value.flow.flowJson, data.value.application.answersJson);
});
</script>

<template>
  <section class="space-y-6">
    <NuxtLink to="/applications/archive" class="text-sm hover:underline" style="color: var(--color-accent)">
      &larr; {{ t("applications.archive") }}
    </NuxtLink>

    <div v-if="pending" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-md" />
    </div>
    <div v-else-if="error" class="alert alert-error">{{ t("common.error") }}</div>

    <template v-else-if="data?.application">
      <div class="detail-card">
        <div class="flex items-center gap-3 mb-4">
          <img
            v-if="data.application.discordAvatarUrl"
            :src="data.application.discordAvatarUrl"
            class="w-12 h-12 rounded-full"
            alt=""
          />
          <div>
            <p class="text-lg font-semibold">{{ data.application.discordUsername }}</p>
            <p class="text-sm" style="color: var(--color-base-content-secondary)">
              {{ data.flow?.name }} &middot; {{ new Date(data.application.createdAt).toLocaleDateString() }}
            </p>
          </div>
          <span
            class="ml-auto text-sm font-medium px-3 py-1 rounded-lg"
            :style="{
              background: data.application.status === 'approved'
                ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                : 'color-mix(in srgb, var(--color-error) 15%, transparent)',
              color: data.application.status === 'approved'
                ? 'var(--color-success)'
                : 'var(--color-error)'
            }"
          >
            {{ t(`applications.status.${data.application.status}`) }}
          </span>
        </div>

        <div v-if="data.application.reviewedAt" class="text-sm mb-4" style="color: var(--color-base-content-secondary)">
          Reviewed on {{ new Date(data.application.reviewedAt).toLocaleDateString() }}
        </div>

        <!-- Answers in flow-path context -->
        <div class="space-y-4">
          <template v-if="linearized">
            <div v-for="(step, i) in linearized.steps" :key="i">
              <template v-if="step.type === 'input' || step.type === 'input_group'">
                <div v-for="field in step.fields" :key="field.nodeId" class="answer-row">
                  <p class="answer-row__label">{{ field.label }}</p>
                  <p class="answer-row__value">{{ data.application.answersJson[field.nodeId] ?? '—' }}</p>
                </div>
              </template>
            </div>
          </template>
          <template v-else>
            <div v-for="(value, key) in data.application.answersJson" :key="key" class="answer-row">
              <p class="answer-row__label">{{ key }}</p>
              <p class="answer-row__value">{{ value ?? '—' }}</p>
            </div>
          </template>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.detail-card {
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: var(--color-surface-2);
  box-shadow: var(--shadow-sm);
}

.answer-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-line);
}

.answer-row:last-child {
  border-bottom: none;
}

.answer-row__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-base-content-secondary);
  margin-bottom: 0.25rem;
}

.answer-row__value {
  font-size: 0.9375rem;
  color: var(--color-base-content);
}
</style>
