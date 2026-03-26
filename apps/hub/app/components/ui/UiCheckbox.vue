<script setup lang="ts">
const model = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    label: string;
    description?: string;
    disabled?: boolean;
    id?: string;
    size?: "md" | "sm" | "xs";
  }>(),
  {
    description: "",
    disabled: false,
    id: undefined,
    size: "md"
  }
);

const autoId = useId();
const inputId = computed(() => props.id || `checkbox-field-${autoId}`);
</script>

<template>
  <div class="field" :class="[`field--${size}`]">
    <label class="field__label" :for="inputId">{{ label }}</label>
    <label class="checkbox-field" :for="inputId">
      <input :id="inputId" v-model="model" type="checkbox" class="checkbox-field__input" :disabled="disabled">
      <span class="checkbox-field__label"><slot>{{ description }}</slot></span>
    </label>
  </div>
</template>
