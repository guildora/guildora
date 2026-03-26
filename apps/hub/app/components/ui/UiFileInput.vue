<script setup lang="ts">
const model = defineModel<File | null>({ default: null });

const props = withDefaults(
  defineProps<{
    label: string;
    disabled?: boolean;
    accept?: string;
    id?: string;
    name?: string;
  }>(),
  {
    disabled: false,
    accept: "",
    id: undefined,
    name: undefined
  }
);

const emit = defineEmits<{
  change: [File | null];
}>();

const attrs = useAttrs();
const autoId = useId();
const inputId = computed(() => props.id || `ui-file-${autoId}`);

const onChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0] || null;
  model.value = file;
  emit("change", file);
};
</script>

<template>
  <div class="field">
    <label class="field__label" :for="inputId">{{ label }}</label>
    <div class="field__control">
      <input
        :id="inputId"
        type="file"
        class="field__file"
        :disabled="disabled"
        :accept="accept"
        :name="name"
        v-bind="attrs"
        @change="onChange"
      >
    </div>
  </div>
</template>
