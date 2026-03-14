<script setup lang="ts">
import {
  defaultAppearancePreference,
  normalizeAppearancePreference,
  type AppearancePreference
} from "../../../utils/appearance";

const props = defineProps<{
  modelValue?: AppearancePreference | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [AppearancePreference];
}>();

const { setPreference } = useAppearance();

const value = computed<AppearancePreference>(() =>
  normalizeAppearancePreference(props.modelValue, defaultAppearancePreference)
);

watch(
  value,
  (next) => {
    setPreference(next);
  },
  { immediate: true }
);

function onAppearanceChange(event: Event) {
  const next = normalizeAppearancePreference((event.target as HTMLSelectElement).value, defaultAppearancePreference);
  emit("update:modelValue", next);
  setPreference(next);
}
</script>

<template>
  <UiRetroSelect
    class="w-44"
    size="sm"
    :label="$t('appearance.label')"
    :model-value="value"
   
    @change="onAppearanceChange"
  >
    <option value="light">{{ $t("appearance.light") }}</option>
    <option value="dark">{{ $t("appearance.dark") }}</option>
    <option value="system">{{ $t("appearance.system") }}</option>
  </UiRetroSelect>
</template>
