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
  }>(),
  {
    required: false,
    placeholder: "",
    disabled: false,
    maxlength: undefined,
    type: "text",
    name: undefined,
    id: undefined,
    size: "md"
  }
);

const attrs = useAttrs();
const autoId = useId();
const inputId = computed(() => props.id || `ui-input-${autoId}`);
const slots = useSlots();
const hasTrailing = computed(() => Boolean(slots.trailing));
</script>

<template>
  <div class="field" :class="[`field--${size}`]">
    <label class="field__label" :for="inputId">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <div class="field__control">
      <input
        :id="inputId"
        v-model="model"
        class="field__input"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :type="type"
        :name="name"
        v-bind="attrs"
      >
      <span v-if="hasTrailing" class="field__trailing">
        <slot name="trailing" />
      </span>
    </div>
  </div>
</template>
