<script setup lang="ts">
import type { ApplicationFlowGraph } from "@guildora/shared";
import { linearizeFlowGraph } from "@guildora/shared";

definePageMeta({
  middleware: ["moderator"],
});

const route = useRoute();
const applicationId = route.params.applicationId as string;
const { t } = useI18n();
const router = useRouter();

type ApplicationDetail = {
  application: {
    id: string;
    flowId: string;
    discordId: string;
    discordUsername: string;
    discordAvatarUrl: string | null;
    answersJson: Record<string, unknown>;
    status: string;
    rolesAssigned: string[] | null;
    pendingRoleAssignments: string[] | null;
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
  previousApplications: {
    id: string;
    flowId: string;
    status: string;
    createdAt: string;
  }[];
};

const { data, pending, error, refresh } = await useFetch<ApplicationDetail>(
  `/api/applications/${applicationId}`
);

const actionPending = ref(false);
const actionError = ref("");
const actionWarnings = ref<string[]>([]);

// Linearize the flow to show answers in context
const linearized = computed(() => {
  if (!data.value?.flow?.flowJson || !data.value?.application?.answersJson) return null;
  return linearizeFlowGraph(data.value.flow.flowJson, data.value.application.answersJson);
});

async function approve() {
  actionPending.value = true;
  actionError.value = "";
  actionWarnings.value = [];
  try {
    const result = await $fetch<{ success: boolean; warnings?: string[] }>(
      `/api/applications/${applicationId}/approve`,
      { method: "POST" }
    );
    actionWarnings.value = result.warnings || [];
    await refresh();
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; statusMessage?: string };
    actionError.value = e?.data?.message || e?.statusMessage || "Failed to approve.";
  } finally {
    actionPending.value = false;
  }
}

async function reject() {
  actionPending.value = true;
  actionError.value = "";
  try {
    await $fetch(`/api/applications/${applicationId}/reject`, { method: "POST" });
    await refresh();
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; statusMessage?: string };
    actionError.value = e?.data?.message || e?.statusMessage || "Failed to reject.";
  } finally {
    actionPending.value = false;
  }
}

async function retryRoles() {
  actionPending.value = true;
  try {
    await $fetch(`/api/applications/${applicationId}/retry-roles`, { method: "POST" });
    await refresh();
  } catch {
    actionError.value = "Failed to retry role assignment.";
  } finally {
    actionPending.value = false;
  }
}

function getAnswerLabel(nodeId: string): string {
  if (!linearized.value) return nodeId;
  for (const step of linearized.value.steps) {
    const field = step.fields?.find((f) => f.nodeId === nodeId);
    if (field) return field.label;
  }
  return nodeId;
}
</script>

<template>
  <section class="space-y-6">
    <NuxtLink to="/applications/open" class="text-sm hover:underline" style="color: var(--color-accent)">
      &larr; {{ t("applications.openApplications") }}
    </NuxtLink>

    <div v-if="pending" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-md" />
    </div>
    <div v-else-if="error" class="alert alert-error">{{ t("common.error") }}</div>

    <template v-else-if="data?.application">
      <!-- Previous application warning -->
      <div
        v-if="data.previousApplications.length > 0"
        class="alert alert-warning"
      >
        <Icon name="proicons:warning" />
        <span>
          {{ t("applications.detail.previousApplications", { count: data.previousApplications.length }) }}
          <NuxtLink
            v-for="pa in data.previousApplications"
            :key="pa.id"
            :to="`/applications/archive/${pa.id}`"
            class="underline ml-1"
          >
            {{ pa.status }} ({{ new Date(pa.createdAt).toLocaleDateString() }})
          </NuxtLink>
        </span>
      </div>

      <!-- Pending roles warning -->
      <div
        v-if="data.application.pendingRoleAssignments?.length"
        class="alert alert-warning"
      >
        <Icon name="proicons:warning" />
        <span>{{ t("applications.detail.roleAssignmentFailed") }}</span>
        <button
          class="btn btn-warning btn-sm ml-auto"
          :disabled="actionPending"
          @click="retryRoles"
        >
          {{ t("applications.actions.retryRoles") }}
        </button>
      </div>

      <!-- Applicant info -->
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
              Discord ID: {{ data.application.discordId }} &middot; {{ new Date(data.application.createdAt).toLocaleDateString() }}

            </p>
          </div>
          <span
            class="ml-auto text-sm font-medium px-3 py-1 rounded-lg"
            :style="{
              background: data.application.status === 'pending'
                ? 'color-mix(in srgb, var(--color-warning) 15%, transparent)'
                : data.application.status === 'approved'
                  ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                  : 'color-mix(in srgb, var(--color-error) 15%, transparent)',
              color: data.application.status === 'pending'
                ? 'var(--color-warning)'
                : data.application.status === 'approved'
                  ? 'var(--color-success)'
                  : 'var(--color-error)'
            }"
          >
            {{ t(`applications.status.${data.application.status}`) }}
          </span>
        </div>

        <div v-if="data.application.displayNameComposed" class="mb-4 text-sm">
          <strong>{{ t("applications.detail.displayName") }}</strong> {{ data.application.displayNameComposed }}
        </div>

        <!-- Answers in flow-path context -->
        <div class="space-y-4">
          <template v-if="linearized">
            <div
              v-for="(step, i) in linearized.steps"
              :key="i"
            >
              <!-- Skip info and abort nodes -->
              <template v-if="step.type === 'input' || step.type === 'input_group'">
                <div
                  v-for="field in step.fields"
                  :key="field.nodeId"
                  class="answer-row"
                >
                  <p class="answer-row__label">{{ field.label }}</p>
                  <p class="answer-row__value">
                    {{ data.application.answersJson[field.nodeId] ?? '—' }}
                  </p>
                </div>
              </template>
            </div>
          </template>

          <!-- Fallback: flat answer list if no flow available -->
          <template v-else>
            <div
              v-for="(value, key) in data.application.answersJson"
              :key="key"
              class="answer-row"
            >
              <p class="answer-row__label">{{ key }}</p>
              <p class="answer-row__value">{{ value ?? '—' }}</p>
            </div>
          </template>
        </div>

        <!-- Role badges -->
        <div v-if="data.application.rolesAssigned?.length" class="mt-4">
          <p class="text-sm font-medium mb-1" style="color: var(--color-base-content-secondary)">{{ t("applications.detail.rolesAssigned") }}</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="roleId in data.application.rolesAssigned"
              :key="roleId"
              class="text-xs px-2 py-0.5 rounded"
              style="background: var(--color-surface-3)"
            >
              @{{ roleId }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div v-if="data.application.status === 'pending'" class="flex gap-3">
        <button
          class="btn btn-primary"
          :disabled="actionPending"
          @click="approve"
        >
          {{ t("applications.actions.approve") }}
        </button>
        <button
          class="btn btn-error btn-outline"
          :disabled="actionPending"
          @click="reject"
        >
          {{ t("applications.actions.reject") }}
        </button>
      </div>

      <div v-if="actionError" class="alert alert-error">{{ actionError }}</div>
      <div v-for="(warning, i) in actionWarnings" :key="i" class="alert alert-warning">{{ warning }}</div>

      <!-- Reviewed info -->
      <div v-if="data.application.reviewedAt" class="text-sm" style="color: var(--color-base-content-secondary)">
        {{ t("applications.detail.reviewedOn", { date: new Date(data.application.reviewedAt).toLocaleDateString() }) }}
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
