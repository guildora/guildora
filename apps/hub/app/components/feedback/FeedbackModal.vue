<script setup lang="ts">
const { t } = useI18n();

const isOpen = ref(false);
const isLoading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const title = ref("");
const category = ref<string | null>(null);
const description = ref<string | null>(null);

function open() {
  title.value = "";
  category.value = null;
  description.value = null;
  successMessage.value = "";
  errorMessage.value = "";
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

async function submit() {
  successMessage.value = "";
  errorMessage.value = "";
  isLoading.value = true;

  try {
    await $fetch("/api/feedback", {
      method: "POST",
      body: {
        title: title.value,
        category: category.value,
        description: description.value
      }
    });
    successMessage.value = t("feedback.successMessage");
    title.value = "";
    category.value = null;
    description.value = null;
  } catch {
    errorMessage.value = t("feedback.errorMessage");
  } finally {
    isLoading.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box bg-surface-2 shadow-lg max-w-lg">
      <UiModalTitle :title="t('feedback.modalTitle')" :subtitle="t('feedback.modalSubtitle')" />

      <div v-if="successMessage" class="alert alert-success mt-4 text-sm">
        {{ successMessage }}
      </div>

      <div v-if="!successMessage" class="mt-4 space-y-4">
        <UiInput
          v-model="title"
          :label="t('feedback.titleLabel')"
          :placeholder="t('feedback.titlePlaceholder')"
          required
          :maxlength="150"
        />

        <UiSelect
          v-model="category"
          :label="t('feedback.categoryLabel')"
          required
        >
          <option value="" disabled>{{ t('feedback.categoryLabel') }}</option>
          <option value="Bug">{{ t('feedback.categoryBug') }}</option>
          <option value="Feature Request">{{ t('feedback.categoryFeature') }}</option>
          <option value="Other">{{ t('feedback.categoryOther') }}</option>
        </UiSelect>

        <UiTextarea
          v-model="description"
          :label="t('feedback.descriptionLabel')"
          :placeholder="t('feedback.descriptionPlaceholder')"
          required
          :maxlength="5000"
          :rows="4"
        />

        <div v-if="errorMessage" class="text-error text-sm">
          {{ errorMessage }}
        </div>
      </div>

      <div class="modal-action mt-4">
        <UiButton variant="secondary" type="button" @click="close">
          {{ t('common.cancel') }}
        </UiButton>
        <UiButton
          v-if="!successMessage"
          variant="primary"
          type="button"
          :disabled="isLoading"
          @click="submit"
        >
          {{ isLoading ? t('feedback.submitting') : t('feedback.submit') }}
        </UiButton>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="close">{{ t('common.close') }}</button>
    </form>
  </dialog>
</template>
