<script setup lang="ts">
definePageMeta({
  middleware: ["settings"],
});

const lastPath = useCookie<string | null>("guildora_settings_last_path", { sameSite: "lax" });
lastPath.value = "/settings/landing";

const { t } = useI18n();

interface LandingSection {
  id: string;
  blockType: string;
  sortOrder: number;
  visible: boolean;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

interface BlockType {
  type: string;
  name: { en: string; de: string };
  description: { en: string; de: string };
  icon: string;
}

interface LandingTemplate {
  id: string;
  name: string;
  description: string | null;
}

interface PageConfig {
  id?: number;
  activeTemplate: string;
  customCss: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

const loading = ref(true);
const saving = ref(false);
const saveSuccess = ref("");
const saveError = ref("");

const sections = ref<LandingSection[]>([]);
const blockTypes = ref<BlockType[]>([]);
const templates = ref<LandingTemplate[]>([]);
const pageConfig = ref<PageConfig>({ activeTemplate: "default", customCss: null, metaTitle: null, metaDescription: null });

const showBlockCatalog = ref(false);
const showCssEditor = ref(false);
const showSeoSettings = ref(false);
const showTemplatePicker = ref(false);
const editingSection = ref<LandingSection | null>(null);
const editLocale = ref<"en" | "de">("en");

const draggedIndex = ref<number | null>(null);

async function loadData() {
  loading.value = true;
  try {
    const [pageData, blocksData] = await Promise.all([
      $fetch<{ page: PageConfig | null; templates: LandingTemplate[]; sections: LandingSection[] }>("/api/admin/landing/page"),
      $fetch<{ blocks: BlockType[] }>("/api/admin/landing/blocks")
    ]);
    sections.value = pageData.sections;
    templates.value = pageData.templates;
    blockTypes.value = blocksData.blocks;
    if (pageData.page) {
      pageConfig.value = pageData.page;
    }
  } catch {
    saveError.value = "Failed to load landing page data.";
  } finally {
    loading.value = false;
  }
}

async function addBlock(blockType: string) {
  saving.value = true;
  try {
    const defaultContent = { en: {}, de: {} };
    const { section } = await $fetch<{ section: LandingSection }>("/api/admin/landing/sections", {
      method: "POST",
      body: {
        blockType,
        sortOrder: sections.value.length,
        content: defaultContent
      }
    });
    sections.value.push(section);
    showBlockCatalog.value = false;
    flashSuccess();
  } catch {
    saveError.value = "Failed to add block.";
  } finally {
    saving.value = false;
  }
}

async function removeSection(id: string) {
  if (!confirm(t("landingEditor.removeBlockConfirm"))) return;
  saving.value = true;
  try {
    await $fetch(`/api/admin/landing/sections/${id}`, { method: "DELETE" });
    sections.value = sections.value.filter((s) => s.id !== id);
    if (editingSection.value?.id === id) editingSection.value = null;
    flashSuccess();
  } catch {
    saveError.value = "Failed to remove block.";
  } finally {
    saving.value = false;
  }
}

async function toggleVisibility(section: LandingSection) {
  saving.value = true;
  try {
    await $fetch(`/api/admin/landing/sections/${section.id}`, {
      method: "PUT",
      body: { visible: !section.visible }
    });
    section.visible = !section.visible;
  } catch {
    saveError.value = "Failed to toggle visibility.";
  } finally {
    saving.value = false;
  }
}

async function saveSection(section: LandingSection) {
  saving.value = true;
  try {
    await $fetch(`/api/admin/landing/sections/${section.id}`, {
      method: "PUT",
      body: { content: section.content, config: section.config }
    });
    flashSuccess();
  } catch {
    saveError.value = "Failed to save section.";
  } finally {
    saving.value = false;
  }
}

async function saveSortOrder() {
  saving.value = true;
  try {
    const order = sections.value.map((s, i) => ({ id: s.id, sortOrder: i }));
    await $fetch("/api/admin/landing/sections/reorder", {
      method: "PUT",
      body: { order }
    });
    sections.value.forEach((s, i) => { s.sortOrder = i; });
  } catch {
    saveError.value = "Failed to reorder blocks.";
  } finally {
    saving.value = false;
  }
}

async function switchTemplate(templateId: string) {
  saving.value = true;
  try {
    await $fetch("/api/admin/landing/template", {
      method: "PUT",
      body: { templateId }
    });
    pageConfig.value.activeTemplate = templateId;
    showTemplatePicker.value = false;
    flashSuccess();
  } catch {
    saveError.value = "Failed to switch template.";
  } finally {
    saving.value = false;
  }
}

async function savePageConfig() {
  saving.value = true;
  try {
    await $fetch("/api/admin/landing/page", {
      method: "PUT",
      body: {
        customCss: pageConfig.value.customCss,
        metaTitle: pageConfig.value.metaTitle,
        metaDescription: pageConfig.value.metaDescription
      }
    });
    flashSuccess();
  } catch {
    saveError.value = "Failed to save page settings.";
  } finally {
    saving.value = false;
  }
}

async function resetToTemplate() {
  if (!confirm(t("landingEditor.resetConfirm"))) return;
  saving.value = true;
  try {
    await $fetch("/api/admin/landing/reset", { method: "POST" });
    await loadData();
    editingSection.value = null;
    flashSuccess();
  } catch {
    saveError.value = "Failed to reset.";
  } finally {
    saving.value = false;
  }
}

function flashSuccess() {
  saveSuccess.value = t("landingEditor.saved");
  saveError.value = "";
  setTimeout(() => { saveSuccess.value = ""; }, 3000);
}

function blockName(type: string): string {
  const block = blockTypes.value.find((b) => b.type === type);
  if (!block) return type;
  return editLocale.value === "de" ? block.name.de : block.name.en;
}

function onDragStart(index: number) {
  draggedIndex.value = index;
}

function onDragOver(event: DragEvent, index: number) {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  const moved = sections.value.splice(draggedIndex.value, 1)[0];
  sections.value.splice(index, 0, moved);
  draggedIndex.value = index;
}

function onDragEnd() {
  draggedIndex.value = null;
  saveSortOrder();
}

function getLocaleContent(section: LandingSection): Record<string, unknown> {
  const c = section.content as Record<string, Record<string, unknown>>;
  return c[editLocale.value] || c.en || {};
}

function setLocaleContent(section: LandingSection, key: string, value: unknown) {
  const c = section.content as Record<string, Record<string, unknown>>;
  if (!c[editLocale.value]) c[editLocale.value] = {};
  c[editLocale.value][key] = value;
}

onMounted(() => loadData());
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ t("landingEditor.title") }}</h1>
        <p class="text-sm opacity-60">{{ t("landingEditor.description") }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="btn-group">
          <button :class="['btn btn-sm', editLocale === 'en' ? 'btn-active' : '']" @click="editLocale = 'en'">EN</button>
          <button :class="['btn btn-sm', editLocale === 'de' ? 'btn-active' : '']" @click="editLocale = 'de'">DE</button>
        </div>
      </div>
    </div>

    <!-- Status messages -->
    <div v-if="saveSuccess" class="alert alert-success text-sm">{{ saveSuccess }}</div>
    <div v-if="saveError" class="alert alert-error text-sm">{{ saveError }}</div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <template v-else>
      <!-- Action bar -->
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-primary btn-sm" @click="showBlockCatalog = true">{{ t("landingEditor.addBlock") }}</button>
        <button class="btn btn-outline btn-sm" @click="showTemplatePicker = !showTemplatePicker">{{ t("landingEditor.templateSwitch") }}</button>
        <button class="btn btn-outline btn-sm" @click="showSeoSettings = !showSeoSettings">{{ t("landingEditor.seoSettings") }}</button>
        <button class="btn btn-outline btn-sm" @click="showCssEditor = !showCssEditor">{{ t("landingEditor.customCss") }}</button>
        <button class="btn btn-error btn-outline btn-sm ml-auto" @click="resetToTemplate">{{ t("landingEditor.resetToTemplate") }}</button>
      </div>

      <!-- Template picker -->
      <div v-if="showTemplatePicker" class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-lg">{{ t("landingEditor.templateSwitch") }}</h3>
          <div class="grid gap-3 sm:grid-cols-3">
            <button
              v-for="tmpl in templates"
              :key="tmpl.id"
              :class="['card bg-base-100 cursor-pointer transition-all', pageConfig.activeTemplate === tmpl.id ? 'ring-2 ring-accent' : 'hover:ring-1 hover:ring-base-content/20']"
              @click="switchTemplate(tmpl.id)"
            >
              <div class="card-body p-4">
                <h4 class="font-bold">{{ tmpl.name }}</h4>
                <p v-if="tmpl.description" class="text-xs opacity-60">{{ tmpl.description }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- SEO settings -->
      <div v-if="showSeoSettings" class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-lg">{{ t("landingEditor.seoSettings") }}</h3>
          <div class="form-control">
            <label class="label"><span class="label-text">{{ t("landingEditor.metaTitle") }}</span></label>
            <input v-model="pageConfig.metaTitle" type="text" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{{ t("landingEditor.metaDescription") }}</span></label>
            <textarea v-model="pageConfig.metaDescription" class="textarea textarea-bordered" rows="3" />
          </div>
          <div class="card-actions justify-end">
            <button class="btn btn-primary btn-sm" :disabled="saving" @click="savePageConfig">
              {{ saving ? t("landingEditor.saving") : t("landingEditor.seoSettings") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom CSS -->
      <div v-if="showCssEditor" class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-lg">{{ t("landingEditor.customCss") }}</h3>
          <textarea
            v-model="pageConfig.customCss"
            class="textarea textarea-bordered font-mono text-sm"
            rows="10"
            placeholder="/* Custom CSS for your landing page */"
          />
          <div class="card-actions justify-end">
            <button class="btn btn-primary btn-sm" :disabled="saving" @click="savePageConfig">
              {{ saving ? t("landingEditor.saving") : t("landingEditor.customCss") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Block catalog modal -->
      <div v-if="showBlockCatalog" class="card bg-base-200">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h3 class="card-title text-lg">{{ t("landingEditor.blockCatalog") }}</h3>
            <button class="btn btn-ghost btn-sm btn-circle" @click="showBlockCatalog = false">&times;</button>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="block in blockTypes"
              :key="block.type"
              class="card bg-base-100 cursor-pointer hover:ring-1 hover:ring-accent transition-all text-left"
              @click="addBlock(block.type)"
            >
              <div class="card-body p-4">
                <h4 class="font-bold text-sm">{{ editLocale === 'de' ? block.name.de : block.name.en }}</h4>
                <p class="text-xs opacity-60">{{ editLocale === 'de' ? block.description.de : block.description.en }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Section list -->
      <div v-if="sections.length === 0" class="alert">
        {{ t("landingEditor.noSections") }}
      </div>

      <div class="space-y-3">
        <div
          v-for="(section, index) in sections"
          :key="section.id"
          :class="['card bg-base-200 transition-all', !section.visible && 'opacity-50', draggedIndex === index && 'ring-2 ring-accent']"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragover="(e) => onDragOver(e, index)"
          @dragend="onDragEnd"
        >
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <!-- Drag handle -->
              <div class="cursor-grab text-lg opacity-40 hover:opacity-70">&#x2630;</div>

              <!-- Block info -->
              <div class="flex-1">
                <span class="font-bold text-sm">{{ blockName(section.blockType) }}</span>
                <span class="badge badge-ghost badge-sm ml-2">{{ section.blockType }}</span>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1">
                <button
                  :class="['btn btn-ghost btn-xs', section.visible ? 'opacity-70' : 'opacity-40']"
                  :title="section.visible ? 'Hide' : 'Show'"
                  @click="toggleVisibility(section)"
                >
                  {{ section.visible ? '&#x1F441;' : '&#x1F576;' }}
                </button>
                <button
                  class="btn btn-ghost btn-xs"
                  @click="editingSection = editingSection?.id === section.id ? null : section"
                >
                  &#x270E;
                </button>
                <button class="btn btn-ghost btn-xs text-error" @click="removeSection(section.id)">
                  &#x2716;
                </button>
              </div>
            </div>

            <!-- Inline editor -->
            <div v-if="editingSection?.id === section.id" class="mt-4 space-y-3 border-t border-base-300 pt-4">
              <div v-for="(value, key) in getLocaleContent(section)" :key="String(key)" class="form-control">
                <label class="label"><span class="label-text text-xs font-medium">{{ key }}</span></label>
                <textarea
                  v-if="typeof value === 'string' && value.length > 80"
                  :value="String(value)"
                  class="textarea textarea-bordered textarea-sm"
                  rows="3"
                  @input="(e) => setLocaleContent(section, String(key), (e.target as HTMLTextAreaElement).value)"
                />
                <input
                  v-else-if="typeof value === 'string'"
                  :value="String(value)"
                  type="text"
                  class="input input-bordered input-sm"
                  @input="(e) => setLocaleContent(section, String(key), (e.target as HTMLInputElement).value)"
                />
                <pre v-else class="bg-base-300 rounded p-2 text-xs overflow-auto max-h-40">{{ JSON.stringify(value, null, 2) }}</pre>
              </div>
              <div class="flex justify-end">
                <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveSection(section)">
                  {{ saving ? t("landingEditor.saving") : "Save" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
