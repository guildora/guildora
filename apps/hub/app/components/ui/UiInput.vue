<script setup lang="ts">
const model = defineModel<string | number | null>({ default: null });

const props = withDefaults(
  defineProps<{
    label: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    maxlength?: number;
    type?: string;
    name?: string;
    id?: string;
    size?: "md" | "sm" | "xs";
    hint?: string;
    error?: string;
    showCounter?: boolean;
  }>(),
  {
    required: false,
    placeholder: "",
    disabled: false,
    maxlength: undefined,
    type: "text",
    name: undefined,
    id: undefined,
    size: "md",
    hint: undefined,
    error: undefined,
    showCounter: false,
  }
);

const attrs = useAttrs();
const autoId = useId();
const inputId = computed(() => props.id || `ui-input-${autoId}`);
const slots = useSlots();
const hasTrailing = computed(() => Boolean(slots.trailing));
const hasLeading = computed(() => Boolean(slots.leading));

const currentLength = computed(() => {
  const val = model.value;
  if (val === null || val === undefined) return 0;
  return String(val).length;
});

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
  <div class="field" :class="[`field--${size}`, { 'field--error': !!error }]">
    <label class="field__label" :for="inputId">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <div class="field__control">
      <span v-if="hasLeading" class="field__leading">
        <slot name="leading" />
      </span>
      <input
        :id="inputId"
        v-model="model"
        class="field__input"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :type="type"
        :name="name"
        :aria-required="required || undefined"
        :aria-invalid="!!error || undefined"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        v-bind="attrs"
      >
      <span v-if="hasTrailing" class="field__trailing">
        <slot name="trailing" />
      </span>
    </div>
    <div v-if="showSubRow" class="field__sub-row">
      <span v-if="error" :id="`${inputId}-error`" class="field__message">{{ error }}</span>
      <span v-else-if="hint" :id="`${inputId}-hint`" class="field__hint">{{ hint }}</span>
      <span v-else />
      <span v-if="showCounter && maxlength" :class="counterClass">
        {{ currentLength }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>
