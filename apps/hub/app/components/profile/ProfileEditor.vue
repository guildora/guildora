<script setup lang="ts">
interface EditableProfile {
  profileName: string;
  ingameName: string;
  rufname: string | null;
}

const props = withDefaults(defineProps<{
  modelValue: EditableProfile;
  showTitle?: boolean;
}>(), {
  showTitle: true
});

const emit = defineEmits<{
  "update:modelValue": [EditableProfile];
  submit: [];
}>();

const localProfile = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});
</script>

<template>
  <form class="space-y-4" @submit.prevent="$emit('submit')">
    <h2 v-if="props.showTitle" class="text-xl font-semibold">{{ $t("profile.title") }}</h2>

    <UiRetroInput
      v-model="localProfile.ingameName"
      :label="$t('profile.ingameName')"
      :required="true"
      maxlength="60"
     
    />

    <UiRetroInput
      v-model="localProfile.rufname"
      :label="$t('profile.rufname')"
      maxlength="60"
     
    />

    <div class="flex justify-end">
      <button type="submit" class="btn btn-primary">{{ $t("common.save") }}</button>
    </div>
  </form>
</template>
