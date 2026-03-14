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
const inputId = computed(() => props.id || `retro-color-${autoId}`);
</script>

<template>
  <div class="retro-field">
    <label class="retro-field__label" :for="inputId">{{ label }}</label>
    <div class="retro-field__control">
      <div class="retro-color-input__group">
        <input v-model="model" type="color" class="retro-color-input__picker" :disabled="disabled">
        <input :id="inputId" v-model="model" type="text" class="retro-color-input__text" :disabled="disabled">
      </div>
    </div>
  </div>
</template>
