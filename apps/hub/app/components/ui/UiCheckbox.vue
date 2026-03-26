<script setup lang="ts">
const model = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    label: string;
    description?: string;
    disabled?: boolean;
    id?: string;
    size?: "md" | "sm" | "xs";
    hint?: string;
    error?: string;
  }>(),
  {
    description: "",
    disabled: false,
    id: undefined,
    size: "md",
    hint: undefined,
    error: undefined,
  }
);

const autoId = useId();
const inputId = computed(() => props.id || `checkbox-field-${autoId}`);
</script>

<template>
  <div class="field" :class="[`field--${size}`, { 'field--error': !!error }]">
    <label class="field__label" :for="inputId">{{ label }}</label>
    <label class="checkbox-field" :for="inputId">
      <input :id="inputId" v-model="model" type="checkbox" class="checkbox-field__input" :disabled="disabled">
      <span class="checkbox-field__label"><slot>{{ description }}</slot></span>
    </label>
    <div v-if="error || hint" class="field__sub-row">
      <span v-if="error" class="field__message">{{ error }}</span>
      <span v-else-if="hint" class="field__hint">{{ hint }}</span>
    </div>
  </div>
</template>
