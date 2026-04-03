<script setup lang="ts">
import { blockSchemas, type BlockField } from "./block-schemas";

const props = defineProps<{
  blockType: string;
  content: Record<string, unknown>;
  locale: string;
}>();

const emit = defineEmits<{
  (e: "update", key: string, value: unknown): void;
}>();

const { t } = useI18n();

const schema = computed(() => blockSchemas[props.blockType] || []);

const localeContent = computed(() => {
  const c = props.content as Record<string, Record<string, unknown>>;
  return c[props.locale] || c.en || {};
});

function getValue(key: string): unknown {
  return localeContent.value[key] ?? "";
}

function getStringValue(key: string): string {
  const v = getValue(key);
  return typeof v === "string" ? v : "";
}

function getArrayValue(key: string): Record<string, unknown>[] {
  const v = getValue(key);
  return Array.isArray(v) ? v : [];
}

function onFieldUpdate(key: string, value: unknown) {
  emit("update", key, value);
}

// Array editor modal state
const arrayEditorField = ref<BlockField | null>(null);
const arrayEditorData = ref<Record<string, unknown>[]>([]);

function openArrayEditor(field: BlockField) {
  arrayEditorField.value = field;
  arrayEditorData.value = JSON.parse(JSON.stringify(getArrayValue(field.key)));
}

function closeArrayEditor() {
  arrayEditorField.value = null;
  arrayEditorData.value = [];
}

function saveArrayEditor() {
  if (arrayEditorField.value) {
    emit("update", arrayEditorField.value.key, JSON.parse(JSON.stringify(arrayEditorData.value)));
  }
  closeArrayEditor();
}

function addArrayItem() {
  if (!arrayEditorField.value?.itemFields) return;
  const newItem: Record<string, unknown> = {};
  for (const field of arrayEditorField.value.itemFields) {
    newItem[field.key] = "";
  }
  arrayEditorData.value.push(newItem);
}

function removeArrayItem(index: number) {
  arrayEditorData.value.splice(index, 1);
}

function moveArrayItem(from: number, to: number) {
  if (to < 0 || to >= arrayEditorData.value.length) return;
  const item = arrayEditorData.value.splice(from, 1)[0];
  arrayEditorData.value.splice(to, 0, item);
}
</script>

<template>
  <div class="space-y-3">
    <template v-for="field in schema" :key="field.key">
      <!-- Text input -->
      <UiInput
        v-if="field.type === 'text' || field.type === 'url'"
        :label="t(field.labelKey)"
        :required="field.required"
        :model-value="getStringValue(field.key)"
        :type="field.type === 'url' ? 'url' : 'text'"
        :placeholder="field.type === 'url' ? 'https://...' : ''"
        @update:model-value="(v) => onFieldUpdate(field.key, v)"
      />

      <!-- Textarea -->
      <UiTextarea
        v-else-if="field.type === 'textarea'"
        :label="t(field.labelKey)"
        :required="field.required"
        :model-value="getStringValue(field.key)"
        :rows="3"
        @update:model-value="(v) => onFieldUpdate(field.key, v)"
      />

      <!-- Select -->
      <UiSelect
        v-else-if="field.type === 'select'"
        :label="t(field.labelKey)"
        :model-value="getStringValue(field.key) || field.options?.[0]?.value || ''"
        @update:model-value="(v) => onFieldUpdate(field.key, v)"
      >
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
          {{ t(opt.labelKey) }}
        </option>
      </UiSelect>

      <!-- Array field -->
      <div v-else-if="field.type === 'array'" class="field">
        <label class="field__label">{{ t(field.labelKey) }}</label>
        <div class="flex items-center gap-3 mt-1">
          <span class="text-sm opacity-60">
            {{ getArrayValue(field.key).length }} {{ getArrayValue(field.key).length === 1 ? t("landingBlocks.common.item") : t("landingBlocks.common.items") }}
          </span>
          <UiButton variant="outline" size="xs" @click="openArrayEditor(field)">
            {{ t("common.edit") }}
          </UiButton>
        </div>
      </div>
    </template>

    <!-- Fallback for unknown block types -->
    <div v-if="schema.length === 0" class="text-sm opacity-60">
      <div v-for="(value, key) in localeContent" :key="String(key)">
        <template v-if="typeof value === 'string'">
          <UiInput
            :label="String(key)"
            :model-value="String(value)"
            @update:model-value="(v) => onFieldUpdate(String(key), v)"
          />
        </template>
        <template v-else>
          <div class="field">
            <label class="field__label">{{ key }}</label>
            <pre class="rounded-lg p-3 text-xs overflow-auto max-h-40" style="background: var(--color-surface-3)">{{ JSON.stringify(value, null, 2) }}</pre>
          </div>
        </template>
      </div>
    </div>

    <!-- Array editor modal -->
    <Teleport to="body">
      <dialog
        v-if="arrayEditorField"
        class="modal"
        :open="!!arrayEditorField"
        @close="closeArrayEditor"
      >
        <div class="modal-box" style="max-width: 40rem;">
          <UiModalTitle>{{ t(arrayEditorField.labelKey) }}</UiModalTitle>

          <div class="modal-body space-y-4">
            <div
              v-for="(item, index) in arrayEditorData"
              :key="index"
              class="rounded-xl p-4 space-y-3"
              style="background: var(--color-surface-3)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium opacity-50">#{{ index + 1 }}</span>
                <div class="flex items-center gap-1">
                  <UiButton variant="ghost" size="xs" icon-only :disabled="index === 0" @click="moveArrayItem(index, index - 1)">
                    <Icon name="proicons:chevron-up" class="h-3 w-3" />
                  </UiButton>
                  <UiButton variant="ghost" size="xs" icon-only :disabled="index === arrayEditorData.length - 1" @click="moveArrayItem(index, index + 1)">
                    <Icon name="proicons:chevron-down" class="h-3 w-3" />
                  </UiButton>
                  <UiButton variant="ghost" size="xs" icon-only class="text-red-400" @click="removeArrayItem(index)">
                    <Icon name="proicons:delete" class="h-3 w-3" />
                  </UiButton>
                </div>
              </div>

              <template v-for="itemField in arrayEditorField.itemFields" :key="itemField.key">
                <UiInput
                  v-if="itemField.type === 'text' || itemField.type === 'url'"
                  :label="t(itemField.labelKey)"
                  :required="itemField.required"
                  :model-value="String(item[itemField.key] ?? '')"
                  :type="itemField.type === 'url' ? 'url' : 'text'"
                  :placeholder="itemField.type === 'url' ? 'https://...' : ''"
                  @update:model-value="(v) => { item[itemField.key] = v; }"
                />
                <UiTextarea
                  v-else-if="itemField.type === 'textarea'"
                  :label="t(itemField.labelKey)"
                  :required="itemField.required"
                  :model-value="String(item[itemField.key] ?? '')"
                  :rows="2"
                  @update:model-value="(v) => { item[itemField.key] = v; }"
                />
              </template>
            </div>

            <UiButton variant="outline" size="sm" @click="addArrayItem">
              {{ t("landingBlocks.common.addItem") }}
            </UiButton>
          </div>

          <div class="modal-action">
            <UiButton variant="ghost" @click="closeArrayEditor">{{ t("common.cancel") }}</UiButton>
            <UiButton variant="primary" @click="saveArrayEditor">{{ t("common.save") }}</UiButton>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="closeArrayEditor">close</button>
        </form>
      </dialog>
    </Teleport>
  </div>
</template>
