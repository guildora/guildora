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
    hint?: string;
    error?: string;
    showCounter?: boolean;
  }>(),
  {
    required: false,
    placeholder: "",
    disabled: false,
    maxlength: undefined,
    rows: 3,
    name: undefined,
    id: undefined,
    hint: undefined,
    error: undefined,
    showCounter: false,
  }
);

const attrs = useAttrs();
const autoId = useId();
const textareaId = computed(() => props.id || `ui-textarea-${autoId}`);

const currentLength = computed(() => model.value?.length ?? 0);

const counterClass = computed(() => {
  if (!props.maxlength) return "field__counter";
  const ratio = currentLength.value / props.maxlength;
  if (ratio >= 1) return "field__counter field__counter--limit";
  if (ratio >= 0.8) return "field__counter field__counter--warn";
  return "field__counter";
});

const showSubRow = computed(() =>
  (props.showCounter && props.maxlength) || props.hint || props.error
);
</script>

<template>
  <div class="field field--textarea" :class="{ 'field--error': !!error }">
    <label class="field__label" :for="textareaId">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <div class="field__control field__control--textarea">
      <textarea
        :id="textareaId"
        v-model="model"
        class="field__textarea"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :rows="rows"
        :name="name"
        :aria-required="required || undefined"
        :aria-invalid="!!error || undefined"
        :aria-describedby="error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined"
        v-bind="attrs"
      />
    </div>
    <div v-if="showSubRow" class="field__sub-row">
      <span v-if="error" :id="`${textareaId}-error`" class="field__message">{{ error }}</span>
      <span v-else-if="hint" :id="`${textareaId}-hint`" class="field__hint">{{ hint }}</span>
      <span v-else />
      <span v-if="showCounter && maxlength" :class="counterClass">
        {{ currentLength }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>
