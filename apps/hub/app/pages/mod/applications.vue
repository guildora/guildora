<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

const lastPath = useCookie<string | null>("guildora_mod_last_path", { sameSite: "lax" });
lastPath.value = "/mod/applications";

const { t } = useI18n();

interface ApplicationItem {
  userId: string;
  discordId: string;
  profileName: string;
  communityRole: string | null;
  applicationStatus: string;
  applicationData: Record<string, unknown>;
}

const { data: applicationsData, pending: applicationsPending, refresh: refreshApplications } = await useFetch<{
  items: ApplicationItem[];
}>("/api/mod/applications");

const selectedApplication = ref<ApplicationItem | null>(null);
const actionError = ref<string | null>(null);

const confirmState = reactive({
  open: false,
  title: "",
  message: "",
  confirmLabel: t("common.confirm"),
  action: null as null | (() => Promise<void>)
});

const openConfirm = (title: string, message: string, action: () => Promise<void>, confirmLabel = t("common.confirm")) => {
  confirmState.open = true;
  confirmState.title = title;
  confirmState.message = message;
  confirmState.confirmLabel = confirmLabel;
  confirmState.action = action;
};

const closeConfirm = () => {
  confirmState.open = false;
  confirmState.title = "";
  confirmState.message = "";
  confirmState.confirmLabel = t("common.confirm");
  confirmState.action = null;
};

const runConfirmAction = async () => {
  if (!confirmState.action) return;
  await confirmState.action();
  closeConfirm();
};

const applicationStatusLabel = (status: string) => {
  if (status === "open" || status === "approved" || status === "rejected") {
    return t(`moderation.applicationStatus.${status}`);
  }
  return status || "-";
};

const openApplicationDetails = (application: ApplicationItem) => {
  selectedApplication.value = application;
};

const closeApplicationDetails = () => {
  selectedApplication.value = null;
};

const approveApplication = (userId: string) => {
  openConfirm(t("moderation.confirm.approveTitle"), t("moderation.confirm.approveMessage"), async () => {
    actionError.value = null;
    try {
      await $fetch(`/api/mod/applications/${userId}/approve`, { method: "POST" });
      await refreshApplications();
      if (selectedApplication.value?.userId === userId) {
        closeApplicationDetails();
      }
    } catch (e) {
      console.error(e);
      actionError.value = t("moderation.errors.approve");
    }
  }, t("moderation.confirm.approveLabel"));
};

const rejectApplication = (userId: string) => {
  openConfirm(t("moderation.confirm.rejectTitle"), t("moderation.confirm.rejectMessage"), async () => {
    actionError.value = null;
    try {
      await $fetch(`/api/mod/applications/${userId}/reject`, { method: "POST" });
      await refreshApplications();
      if (selectedApplication.value?.userId === userId) {
        closeApplicationDetails();
      }
    } catch (e) {
      console.error(e);
      actionError.value = t("moderation.errors.reject");
    }
  }, t("moderation.confirm.rejectLabel"));
};
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("moderation.applications") }}</h1>
      <p class="opacity-80">{{ $t("moderation.description") }}</p>
    </header>

    <div v-if="actionError" class="alert alert-error">
      <span>{{ actionError }}</span>
      <button class="btn btn-ghost btn-sm" type="button" @click="actionError = null">{{ $t("moderation.actions.close") }}</button>
    </div>

    <div class="card bg-base-200">
      <div class="card-body">
        <div v-if="applicationsPending" class="loading loading-spinner loading-md" />
        <div v-else-if="(applicationsData?.items || []).length === 0" class="alert alert-info">{{ $t("moderation.applicationsTab.empty") }}</div>
        <div v-else class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>{{ $t("moderation.applicationsTab.tableName") }}</th>
                <th>{{ $t("moderation.applicationsTab.tableDiscordId") }}</th>
                <th>{{ $t("moderation.applicationsTab.tableActions") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="application in applicationsData?.items || []" :key="application.userId">
                <td>{{ application.profileName }}</td>
                <td>{{ application.discordId }}</td>
                <td>
                  <div class="flex flex-wrap gap-2">
                    <button class="btn btn-xs btn-outline md:btn-sm" type="button" @click="openApplicationDetails(application)">{{ $t("moderation.actions.details") }}</button>
                    <button class="btn btn-xs btn-success md:btn-sm" type="button" @click="approveApplication(application.userId)">{{ $t("moderation.actions.approve") }}</button>
                    <button class="btn btn-xs btn-error md:btn-sm" type="button" @click="rejectApplication(application.userId)">{{ $t("moderation.actions.reject") }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <dialog class="modal" :class="{ 'modal-open': confirmState.open }">
      <div class="modal-box bg-surface-2 shadow-lg">
        <h3 class="text-lg font-semibold">{{ confirmState.title }}</h3>
        <p class="py-3">{{ confirmState.message }}</p>
        <div class="modal-action">
          <button class="btn btn-ghost" type="button" @click="closeConfirm">{{ $t("common.cancel") }}</button>
          <button class="btn btn-primary" type="button" @click="runConfirmAction">{{ confirmState.confirmLabel }}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="closeConfirm">{{ $t("common.close") }}</button>
      </form>
    </dialog>

    <dialog class="modal" :class="{ 'modal-open': !!selectedApplication }">
      <div v-if="selectedApplication" class="modal-box max-w-3xl bg-surface-2 shadow-lg">
        <h3 class="text-lg font-semibold">{{ $t("moderation.applicationDetails.title") }}</h3>
        <div class="mt-4 space-y-2">
          <p><strong>{{ $t("moderation.applicationDetails.name") }}:</strong> {{ selectedApplication.profileName }}</p>
          <p><strong>{{ $t("moderation.applicationDetails.discordId") }}:</strong> {{ selectedApplication.discordId }}</p>
          <p><strong>{{ $t("moderation.applicationDetails.status") }}:</strong> {{ applicationStatusLabel(selectedApplication.applicationStatus) }}</p>
          <div>
            <p class="mb-1 font-medium">{{ $t("moderation.applicationDetails.data") }}</p>
            <pre class="overflow-x-auto rounded-xl bg-base-100 p-4 text-xs shadow-neu-inset">{{ JSON.stringify(selectedApplication.applicationData, null, 2) }}</pre>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" type="button" @click="closeApplicationDetails">{{ $t("moderation.applicationDetails.close") }}</button>
          <button class="btn btn-success" type="button" @click="approveApplication(selectedApplication.userId)">{{ $t("moderation.actions.approve") }}</button>
          <button class="btn btn-error" type="button" @click="rejectApplication(selectedApplication.userId)">{{ $t("moderation.actions.reject") }}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="closeApplicationDetails">{{ $t("common.close") }}</button>
      </form>
    </dialog>
  </section>
</template>
