<script setup lang="ts">
const model = defineModel<string | null>({ default: null });

const props = withDefaults(
  defineProps<{
    label: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    maxlength?: number;
    rows?: number;
    name?: string;
    id?: string;
  }>(),
  {
    required: false,
    placeholder: "",
    disabled: false,
    maxlength: undefined,
    rows: 3,
    name: undefined,
    id: undefined
  }
);

const attrs = useAttrs();
const autoId = useId();
const textareaId = computed(() => props.id || `retro-textarea-${autoId}`);
</script>

<template>
  <div class="retro-field retro-field--textarea">
    <label class="retro-field__label" :for="textareaId">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <div class="retro-field__control retro-field__control--textarea">
      <textarea
        :id="textareaId"
        v-model="model"
        class="retro-field__textarea"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :rows="rows"
        :name="name"
        v-bind="attrs"
      />
    </div>
  </div>
</template>
