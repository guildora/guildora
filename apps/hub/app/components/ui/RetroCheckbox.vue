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
const inputId = computed(() => props.id || `retro-checkbox-${autoId}`);
</script>

<template>
  <div class="retro-field" :class="[`retro-field--${size}`]">
    <label class="retro-field__label" :for="inputId">{{ label }}</label>
    <label class="retro-checkbox" :for="inputId">
      <input :id="inputId" v-model="model" type="checkbox" class="retro-checkbox__input" :disabled="disabled">
      <span class="retro-checkbox__label"><slot>{{ description }}</slot></span>
    </label>
  </div>
</template>
