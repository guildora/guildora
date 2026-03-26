<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  pending: boolean;
  error: string | null;
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
  } | null;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

const closeButtonRef = ref<HTMLButtonElement | null>(null);
const previousBodyOverflow = ref<string | null>(null);
const lastFocusedElement = ref<HTMLElement | null>(null);
const { t } = useI18n();

watch(
  () => props.open,
  async (isOpen) => {
    if (!import.meta.client) {
      return;
    }

    if (isOpen) {
      lastFocusedElement.value = document.activeElement as HTMLElement | null;
      previousBodyOverflow.value = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      await nextTick();
      closeButtonRef.value?.focus();
      return;
    }

    document.body.style.overflow = previousBodyOverflow.value ?? "";
    previousBodyOverflow.value = null;
    lastFocusedElement.value?.focus();
  }
);

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return;
  }
  document.body.style.overflow = previousBodyOverflow.value ?? "";
});
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }" :open="open" @cancel.prevent="emit('close')">
    <div class="modal-box member-modal" role="dialog" aria-modal="true" @keydown.esc="emit('close')">
      <!-- Close Button -->
      <button
        ref="closeButtonRef"
        type="button"
        class="btn btn-ghost btn-circle btn-sm member-modal__close"
        :aria-label="$t('common.close')"
        @click="emit('close')"
      >
        <Icon name="proicons:cancel" class="h-5 w-5" />
      </button>

      <!-- Content -->
      <div class="member-modal__content">
        <div v-if="pending" class="member-modal__loading">
          <div class="loading loading-spinner loading-md" />
        </div>
        <div v-else-if="error" class="alert alert-error">{{ error }}</div>
        <ProfileCard v-else-if="profile" :profile="profile" />
        <div v-else class="alert alert-info">{{ t("common.notFound") }}</div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">{{ $t("common.close") }}</button>
    </form>
  </dialog>
</template>

<style scoped>
.member-modal {
  max-width: 36rem;
  background-color: var(--color-surface-3);
  box-shadow: var(--shadow-lg);
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
}

.member-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: var(--color-text-secondary);
}

.member-modal__close:hover {
  color: var(--color-text-primary);
}

.member-modal__header {
  margin-bottom: 1.25rem;
  padding-right: 2rem;
}

.member-modal__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.member-modal__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.member-modal__content {
  min-height: 6rem;
}

.member-modal__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
}
</style>
