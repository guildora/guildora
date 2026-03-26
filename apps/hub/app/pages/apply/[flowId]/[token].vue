<script setup lang="ts">
import type { ApplicationFlowGraph } from "@guildora/shared";

definePageMeta({
  layout: "apply",
});

const route = useRoute();
const flowId = route.params.flowId as string;
const token = route.params.token as string;
const { t } = useI18n();

type ValidateResponse = {
  valid: boolean;
  user: {
    discordId: string;
    discordUsername: string;
    discordAvatarUrl: string | null;
  };
  flow: {
    id: string;
    name: string;
    flowJson: ApplicationFlowGraph;
    settings: {
      messages: {
        tokenExpired?: string;
        submissionConfirmation?: string;
      };
    };
  };
};

const loading = ref(true);
const error = ref("");
const validationData = ref<ValidateResponse | null>(null);
const submitted = ref(false);
const submittedMessage = ref("");

onMounted(async () => {
  try {
    const result = await $fetch<ValidateResponse>(`/api/apply/${flowId}/validate-token`, {
      method: "POST",
      body: { token }
    });
    validationData.value = result;
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; statusMessage?: string; statusCode?: number };
    if (e?.statusCode === 401) {
      error.value = validationData.value?.flow?.settings?.messages?.tokenExpired
        || t("applications.applyExpired");
    } else {
      error.value = e?.data?.message || e?.statusMessage || t("common.error");
    }
  } finally {
    loading.value = false;
  }
});

function onSubmitted(result: { applicationId: string; message: string }) {
  submitted.value = true;
  submittedMessage.value = result.message;
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Error / Expired -->
    <div
      v-else-if="error"
      class="apply-card"
    >
      <div class="text-center py-8">
        <Icon name="proicons:clock" class="text-4xl mb-4" style="color: var(--color-warning)" />
        <p class="text-lg font-medium mb-2" style="color: var(--color-base-content)">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- Success -->
    <div
      v-else-if="submitted"
      class="apply-card"
    >
      <div class="text-center py-8">
        <Icon name="proicons:checkmark-circle" class="text-4xl mb-4" style="color: var(--color-success)" />
        <p class="text-lg font-medium mb-2" style="color: var(--color-base-content)">
          {{ submittedMessage || t("applications.applySuccess") }}
        </p>
      </div>
    </div>

    <!-- Application Form -->
    <template v-else-if="validationData">
      <div class="apply-card">
        <!-- User info bar -->
        <div class="apply-user-bar">
          <img
            v-if="validationData.user.discordAvatarUrl"
            :src="validationData.user.discordAvatarUrl"
            class="apply-user-bar__avatar"
            alt=""
          />
          <div v-else class="apply-user-bar__avatar-fallback">
            {{ validationData.user.discordUsername.slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <p class="font-medium" style="color: var(--color-base-content)">
              {{ validationData.user.discordUsername }}
            </p>
            <p class="text-sm" style="color: var(--color-base-content-secondary)">
              {{ validationData.flow.name }}
            </p>
          </div>
        </div>

        <ApplicationsFormApplicationForm
          :flow-json="validationData.flow.flowJson"
          :token="token"
          :flow-id="flowId"
          :discord-username="validationData.user.discordUsername"
          @submitted="onSubmitted"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.apply-card {
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.apply-user-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface-3);
}

.apply-user-bar__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.apply-user-bar__avatar-fallback {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--color-accent-content);
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
