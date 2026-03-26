<script setup lang="ts">
const model = defineModel<string | number | null>({ default: null });

const props = withDefaults(
  defineProps<{
    label: string;
    required?: boolean;
    disabled?: boolean;
    name?: string;
    id?: string;
    size?: "md" | "sm" | "xs";
    hint?: string;
    error?: string;
  }>(),
  {
    required: false,
    disabled: false,
    name: undefined,
    id: undefined,
    size: "md",
    hint: undefined,
    error: undefined,
  }
);

const attrs = useAttrs();
const autoId = useId();
const selectId = computed(() => props.id || `ui-select-${autoId}`);
const slots = useSlots();
const hasTrailing = computed(() => Boolean(slots.trailing));
</script>

<template>
  <div class="field" :class="[`field--${size}`, { 'field--error': !!error }]">
    <label class="field__label" :for="selectId">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <div class="field__control">
      <select
        :id="selectId"
        v-model="model"
        class="field__select"
        :disabled="disabled"
        :name="name"
        v-bind="attrs"
      >
        <slot />
      </select>
      <span v-if="hasTrailing" class="field__trailing">
        <slot name="trailing" />
      </span>
    </div>
    <div v-if="error || hint" class="field__sub-row">
      <span v-if="error" class="field__message">{{ error }}</span>
      <span v-else-if="hint" class="field__hint">{{ hint }}</span>
    </div>
  </div>
</template>
