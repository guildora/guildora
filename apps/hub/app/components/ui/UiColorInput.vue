<script setup lang="ts">
const model = defineModel<string>({ default: "#ffffff" });

const props = withDefaults(
  defineProps<{
    label: string;
    disabled?: boolean;
    id?: string;
  }>(),
  {
    disabled: false,
    id: undefined
  }
);

const autoId = useId();
const inputId = computed(() => props.id || `ui-color-${autoId}`);
</script>

<template>
  <div class="field">
    <label class="field__label" :for="inputId">{{ label }}</label>
    <div class="field__control">
      <div class="color-input__group">
        <input v-model="model" type="color" class="color-input__picker" :disabled="disabled">
        <input :id="inputId" v-model="model" type="text" class="color-input__text" :disabled="disabled">
      </div>
    </div>
  </div>
</template>
