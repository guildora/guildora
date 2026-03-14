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
  }>(),
  {
    required: false,
    disabled: false,
    name: undefined,
    id: undefined,
    size: "md"
  }
);

const attrs = useAttrs();
const autoId = useId();
const selectId = computed(() => props.id || `retro-select-${autoId}`);
const slots = useSlots();
const hasTrailing = computed(() => Boolean(slots.trailing));
</script>

<template>
  <div class="retro-field" :class="[`retro-field--${size}`]">
    <label class="retro-field__label" :for="selectId">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <div class="retro-field__control">
      <select
        :id="selectId"
        v-model="model"
        class="retro-field__select"
        :disabled="disabled"
        :name="name"
        v-bind="attrs"
      >
        <slot />
      </select>
      <span v-if="hasTrailing" class="retro-field__trailing">
        <slot name="trailing" />
      </span>
    </div>
  </div>
</template>
