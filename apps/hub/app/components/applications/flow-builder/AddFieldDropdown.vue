<script setup lang="ts">
import type { FlowInputType } from "@guildora/shared";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "add", type: "input" | "info" | "role_assignment", inputType?: FlowInputType): void;
}>();

const open = ref(false);

function toggle() {
  open.value = !open.value;
}

function onClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest(".add-field-dropdown")) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));

interface FieldGroup {
  label: string;
  items: Array<{ label: string; type: "input" | "info" | "role_assignment"; inputType?: FlowInputType }>;
}

const groups = computed<FieldGroup[]>(() => [
  {
    label: t("applications.flowBuilder.simpleMode.fieldGroups.text"),
    items: [
      { label: t("applications.flowBuilder.inputTypes.shortText"), type: "input", inputType: "short_text" },
      { label: t("applications.flowBuilder.inputTypes.longText"), type: "input", inputType: "long_text" },
      { label: t("applications.flowBuilder.inputTypes.number"), type: "input", inputType: "number" },
      { label: t("applications.flowBuilder.inputTypes.email"), type: "input", inputType: "email" },
    ]
  },
  {
    label: t("applications.flowBuilder.simpleMode.fieldGroups.selection"),
    items: [
      { label: t("applications.flowBuilder.inputTypes.radioSelect"), type: "input", inputType: "single_select_radio" },
      { label: t("applications.flowBuilder.inputTypes.dropdownSelect"), type: "input", inputType: "single_select_dropdown" },
      { label: t("applications.flowBuilder.inputTypes.multiSelectCheckboxes"), type: "input", inputType: "multi_select" },
      { label: t("applications.flowBuilder.inputTypes.yesNo"), type: "input", inputType: "yes_no" },
    ]
  },
  {
    label: t("applications.flowBuilder.simpleMode.fieldGroups.special"),
    items: [
      { label: t("applications.flowBuilder.inputTypes.date"), type: "input", inputType: "date" },
      { label: t("applications.flowBuilder.inputTypes.fileUpload"), type: "input", inputType: "file_upload" },
      { label: t("applications.flowBuilder.inputTypes.discordUsername"), type: "input", inputType: "discord_username" },
      { label: t("applications.flowBuilder.inputTypes.discordRoleSingle"), type: "input", inputType: "discord_role_single" },
      { label: t("applications.flowBuilder.inputTypes.discordRoleMulti"), type: "input", inputType: "discord_role_multi" },
    ]
  },
  {
    label: t("applications.flowBuilder.simpleMode.fieldGroups.other"),
    items: [
      { label: t("applications.flowBuilder.nodes.infoBlock"), type: "info" },
      { label: t("applications.flowBuilder.nodes.roleAssignment"), type: "role_assignment" },
    ]
  }
]);

function select(item: FieldGroup["items"][number]) {
  emit("add", item.type, item.inputType);
  open.value = false;
}
</script>

<template>
  <div class="add-field-dropdown" @click.stop>
    <button class="add-field-btn" @click="toggle">
      <Icon name="proicons:plus" class="text-sm" />
      {{ t("applications.flowBuilder.simpleMode.addField") }}
    </button>
    <div v-if="open" class="add-field-dropdown__menu">
      <div v-for="group in groups" :key="group.label" class="add-field-dropdown__group">
        <div class="add-field-dropdown__group-label">{{ group.label }}</div>
        <button
          v-for="item in group.items"
          :key="item.label"
          class="add-field-dropdown__item"
          @click="select(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-field-dropdown {
  position: relative;
}

.add-field-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-accent);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s;
}

.add-field-btn:hover {
  background: var(--color-surface-3);
}

.add-field-dropdown__menu {
  position: absolute;
  z-index: 50;
  top: 100%;
  left: 0;
  min-width: 14rem;
  margin-top: 0.25rem;
  padding: 0.5rem 0;
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,.1));
  max-height: 24rem;
  overflow-y: auto;
}

.add-field-dropdown__group {
  padding: 0.25rem 0;
}

.add-field-dropdown__group + .add-field-dropdown__group {
  border-top: 1px solid var(--color-line);
}

.add-field-dropdown__group-label {
  padding: 0.375rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-base-content-secondary);
}

.add-field-dropdown__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-base-content);
  cursor: pointer;
  transition: background 0.1s;
}

.add-field-dropdown__item:hover {
  background: var(--color-surface-3);
}
</style>
