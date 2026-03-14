<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

const { t } = useI18n();

interface CommunityRoleItem {
  id: number;
  name: string;
  description: string | null;
  permissionRoleName: string;
  sortOrder: number;
}

interface UserModerationItem {
  id: string;
  discordId: string;
  profileName: string;
  ingameName: string;
  rufname: string | null;
  communityRole: string | null;
  communityRoleId: number | null;
  permissionRoles: string[];
}

interface ApplicationItem {
  userId: string;
  discordId: string;
  profileName: string;
  communityRole: string | null;
  applicationStatus: string;
  applicationData: Record<string, unknown>;
}

const search = ref("");
const selectedRoleFilter = ref("");

const { data: roleData, pending: rolePending, refresh: refreshRoles } = await useFetch<{
  communityRoles: CommunityRoleItem[];
  permissionRoles: Array<{ id: number; name: string }>;
}>("/api/mod/community-roles");

const { data: usersData, pending: usersPending, refresh: refreshUsers } = await useFetch<{
  items: UserModerationItem[];
}>("/api/mod/users", {
  query: computed(() => ({
    search: search.value || undefined,
    communityRole: selectedRoleFilter.value || undefined
  }))
});

const { data: applicationsData, pending: applicationsPending, refresh: refreshApplications } = await useFetch<{
  items: ApplicationItem[];
}>("/api/mod/applications");

const roleForm = reactive({
  id: null as number | null,
  name: "",
  description: "",
  permissionRoleName: "user",
  sortOrder: 0
});

const roleSelect = reactive<Record<string, number | null>>({});
const confirmState = reactive({
  open: false,
  title: "",
  message: "",
  confirmLabel: t("common.confirm"),
  action: null as null | (() => Promise<void>)
});

const editProfileState = reactive({
  open: false,
  userId: "",
  ingameName: "",
  rufname: null as string | null
});

const selectedApplication = ref<ApplicationItem | null>(null);
const actionError = ref<string | null>(null);
const activeTab = ref<"roles" | "users" | "applications">("users");

const resetRoleForm = () => {
  roleForm.id = null;
  roleForm.name = "";
  roleForm.description = "";
  roleForm.permissionRoleName = "user";
  roleForm.sortOrder = 0;
};

const saveRole = async () => {
  actionError.value = null;
  try {
    const payload = {
      name: roleForm.name,
      description: roleForm.description || null,
      permissionRoleName: roleForm.permissionRoleName,
      sortOrder: Number(roleForm.sortOrder) || 0
    };

    if (roleForm.id) {
      await $fetch(`/api/mod/community-roles/${roleForm.id}`, { method: "PUT", body: payload });
    } else {
      await $fetch("/api/mod/community-roles", { method: "POST", body: payload });
    }

    resetRoleForm();
    await Promise.all([refreshRoles(), refreshUsers()]);
  } catch (e) {
    console.error(e);
    actionError.value = t("moderation.errors.save");
  }
};

const editRole = (role: CommunityRoleItem) => {
  roleForm.id = role.id;
  roleForm.name = role.name;
  roleForm.description = role.description || "";
  roleForm.permissionRoleName = role.permissionRoleName;
  roleForm.sortOrder = role.sortOrder;
};

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
  if (!confirmState.action) {
    return;
  }
  await confirmState.action();
  closeConfirm();
};

const deleteRole = (id: number) => {
  openConfirm(t("moderation.confirm.deleteRoleTitle"), t("moderation.confirm.deleteRoleMessage"), async () => {
    actionError.value = null;
    try {
      await $fetch(`/api/mod/community-roles/${id}`, { method: "DELETE" });
      await Promise.all([refreshRoles(), refreshUsers()]);
    } catch (e) {
      console.error(e);
      actionError.value = t("moderation.errors.delete");
    }
  }, t("moderation.confirm.deleteRoleLabel"));
};

const changeUserRole = (userId: string) => {
  const roleId = roleSelect[userId];
  if (!roleId) {
    return;
  }
  openConfirm(t("moderation.confirm.changeRoleTitle"), t("moderation.confirm.changeRoleMessage"), async () => {
    actionError.value = null;
    try {
      await $fetch(`/api/mod/users/${userId}/community-role`, {
        method: "PUT",
        body: {
          communityRoleId: roleId
        }
      });
      await Promise.all([refreshUsers(), refreshApplications()]);
    } catch (e) {
      console.error(e);
      actionError.value = t("moderation.errors.roleChange");
    }
  }, t("moderation.confirm.changeRoleLabel"));
};

const triggerSync = async (userId: string) => {
  actionError.value = null;
  try {
    await $fetch(`/api/mod/users/${userId}/sync`, { method: "POST" });
    await Promise.all([refreshUsers(), refreshApplications()]);
  } catch (e) {
    console.error(e);
    actionError.value = t("moderation.errors.discordSync");
  }
};

const openProfileEditor = (userRow: UserModerationItem) => {
  editProfileState.open = true;
  editProfileState.userId = userRow.id;
  editProfileState.ingameName = userRow.ingameName;
  editProfileState.rufname = userRow.rufname;
};

const closeProfileEditor = () => {
  editProfileState.open = false;
  editProfileState.userId = "";
  editProfileState.ingameName = "";
  editProfileState.rufname = null;
};

const saveProfileEdit = async () => {
  if (!editProfileState.userId) {
    return;
  }
  actionError.value = null;
  try {
    await $fetch(`/api/mod/users/${editProfileState.userId}/profile`, {
      method: "PUT",
      body: {
        ingameName: editProfileState.ingameName,
        rufname: editProfileState.rufname
      }
    });
    closeProfileEditor();
    await Promise.all([refreshUsers(), refreshApplications()]);
  } catch (e) {
    console.error(e);
    actionError.value = t("moderation.errors.save");
  }
};

const openApplicationDetails = (application: ApplicationItem) => {
  selectedApplication.value = application;
};

const closeApplicationDetails = () => {
  selectedApplication.value = null;
};

const applicationStatusLabel = (status: string) => {
  if (status === "open" || status === "approved" || status === "rejected") {
    return t(`moderation.applicationStatus.${status}`);
  }
  return status || "-";
};

const approveApplication = (userId: string) => {
  openConfirm(t("moderation.confirm.approveTitle"), t("moderation.confirm.approveMessage"), async () => {
    actionError.value = null;
    try {
      await $fetch(`/api/mod/applications/${userId}/approve`, { method: "POST" });
      await Promise.all([refreshUsers(), refreshApplications()]);
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
      await Promise.all([refreshUsers(), refreshApplications()]);
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
  <div>
    <section class="space-y-6">
    <h1 class="text-2xl font-bold md:text-3xl">{{ $t("moderation.title") }}</h1>
    <p>{{ $t("moderation.description") }}</p>

    <div v-if="actionError" class="alert alert-error">
      <span>{{ actionError }}</span>
      <button class="btn btn-ghost btn-sm" @click="actionError = null">{{ $t("moderation.actions.close") }}</button>
    </div>

    <div role="tablist" class="tabs tabs-boxed mb-4">
      <button
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        {{ $t("moderation.userManagement") }}
      </button>
      <button
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'roles' }"
        @click="activeTab = 'roles'"
      >
        {{ $t("moderation.communityRoles") }}
      </button>
      <button
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'applications' }"
        @click="activeTab = 'applications'"
      >
        {{ $t("moderation.applications") }}
      </button>
    </div>

    <div v-show="activeTab === 'roles'" id="community-roles" class="card bg-base-200">
      <div class="card-body">
        <h2 class="card-title">{{ $t("moderation.communityRoles") }}</h2>
        <div v-if="rolePending" class="loading loading-spinner loading-md" />
        <div v-else class="space-y-4">
          <div class="rounded-2xl bg-base-100 p-4 md:p-5">
            <h3 class="text-sm font-semibold uppercase opacity-70">
              {{ roleForm.id ? $t("moderation.roles.formEditTitle") : $t("moderation.roles.formCreateTitle") }}
            </h3>
            <p class="mt-1 text-sm opacity-75">{{ $t("moderation.roles.formDescription") }}</p>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <div class="form-control gap-2">
                <div class="flex items-center gap-2">
                  <span class="label-text font-medium">{{ $t("moderation.roles.nameLabel") }}</span>
                  <div class="tooltip" :data-tip="$t('moderation.roles.nameTooltip')">
                    <button
                      type="button"
                      class="btn btn-circle btn-ghost btn-xs border border-base-content/20 text-[0.65rem]"
                      :aria-label="$t('moderation.roles.nameTooltip')"
                    >
                      ?
                    </button>
                  </div>
                </div>
                <UiRetroInput
                  v-model="roleForm.name"
                  :label="$t('moderation.roles.nameLabel')"
                  type="text"
                 
                  :aria-describedby="'mod-role-name-help'"
                  :placeholder="$t('moderation.roles.nameLabel')"
                />
                <p id="mod-role-name-help" class="text-xs opacity-70">{{ $t("moderation.roles.nameHelp") }}</p>
              </div>

              <div class="form-control gap-2">
                <div class="flex items-center gap-2">
                  <span class="label-text font-medium">{{ $t("moderation.roles.sortOrderLabel") }}</span>
                  <div class="tooltip" :data-tip="$t('moderation.roles.sortOrderTooltip')">
                    <button
                      type="button"
                      class="btn btn-circle btn-ghost btn-xs border border-base-content/20 text-[0.65rem]"
                      :aria-label="$t('moderation.roles.sortOrderTooltip')"
                    >
                      ?
                    </button>
                  </div>
                </div>
                <UiRetroInput
                  v-model.number="roleForm.sortOrder"
                  :label="$t('moderation.roles.sortOrderLabel')"
                  type="number"
                 
                  min="0"
                  :aria-describedby="'mod-role-sort-help'"
                />
                <p id="mod-role-sort-help" class="text-xs opacity-70">{{ $t("moderation.roles.sortOrderHelp") }}</p>
              </div>

              <div class="form-control gap-2 md:col-span-2">
                <div class="flex items-center gap-2">
                  <span class="label-text font-medium">{{ $t("moderation.roles.permissionRoleLabel") }}</span>
                  <div class="tooltip" :data-tip="$t('moderation.roles.permissionRoleTooltip')">
                    <button
                      type="button"
                      class="btn btn-circle btn-ghost btn-xs border border-base-content/20 text-[0.65rem]"
                      :aria-label="$t('moderation.roles.permissionRoleTooltip')"
                    >
                      ?
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2" role="radiogroup" :aria-describedby="'mod-role-permission-help'">
                  <button
                    v-for="permissionRole in roleData?.permissionRoles || []"
                    :key="permissionRole.id"
                    type="button"
                    class="btn justify-start"
                    :class="roleForm.permissionRoleName === permissionRole.name ? 'btn-primary' : 'btn-secondary'"
                    :aria-pressed="roleForm.permissionRoleName === permissionRole.name"
                    @click="roleForm.permissionRoleName = permissionRole.name"
                  >
                    {{ permissionRole.name }}
                  </button>
                </div>
                <p id="mod-role-permission-help" class="text-xs opacity-70">{{ $t("moderation.roles.permissionRoleHelp") }}</p>
              </div>

              <div class="form-control gap-2 md:col-span-2">
                <div class="flex items-center gap-2">
                  <span class="label-text font-medium">{{ $t("moderation.roles.descriptionLabel") }}</span>
                  <div class="tooltip" :data-tip="$t('moderation.roles.descriptionTooltip')">
                    <button
                      type="button"
                      class="btn btn-circle btn-ghost btn-xs border border-base-content/20 text-[0.65rem]"
                      :aria-label="$t('moderation.roles.descriptionTooltip')"
                    >
                      ?
                    </button>
                  </div>
                </div>
                <UiRetroTextarea
                  v-model="roleForm.description"
                  :label="$t('moderation.roles.descriptionLabel')"
                  rows="3"
                 
                  maxlength="250"
                  :aria-describedby="'mod-role-description-help'"
                  :placeholder="$t('moderation.roles.descriptionLabel')"
                />
                <p id="mod-role-description-help" class="text-xs opacity-70">{{ $t("moderation.roles.descriptionHelp") }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary btn-sm" @click="saveRole">{{ $t("common.save") }}</button>
            <button class="btn btn-ghost btn-sm" @click="resetRoleForm">{{ $t("common.cancel") }}</button>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>{{ $t("moderation.roles.tableName") }}</th>
                  <th>{{ $t("moderation.roles.tablePermission") }}</th>
                  <th>{{ $t("moderation.roles.tableSort") }}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in roleData?.communityRoles || []" :key="role.id">
                  <td>{{ role.name }}</td>
                  <td>{{ role.permissionRoleName }}</td>
                  <td>{{ role.sortOrder }}</td>
                  <td class="text-right">
                    <button class="btn btn-xs btn-outline mr-2" @click="editRole(role)">{{ $t("moderation.actions.edit") }}</button>
                    <button class="btn btn-xs btn-error btn-outline" @click="deleteRole(role.id)">{{ $t("moderation.actions.delete") }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'users'" id="user-management" class="card bg-base-200">
      <div class="card-body">
        <h2 class="card-title">{{ $t("moderation.userManagement") }}</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <UiRetroInput
            v-model="search"
            :label="$t('moderation.users.searchPlaceholder')"
            type="text"
           
            :placeholder="$t('moderation.users.searchPlaceholder')"
          />
          <UiRetroSelect v-model="selectedRoleFilter" :label="$t('moderation.users.allRoles')">
            <option value="">{{ $t("moderation.users.allRoles") }}</option>
            <option v-for="role in roleData?.communityRoles || []" :key="role.id" :value="role.name">{{ role.name }}</option>
          </UiRetroSelect>
        </div>

        <div v-if="usersPending" class="loading loading-spinner loading-md" />
        <div v-else class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>{{ $t("moderation.users.tableName") }}</th>
                  <th>{{ $t("moderation.users.tableCommunityRole") }}</th>
                  <th>{{ $t("moderation.users.tablePermissionRoles") }}</th>
                  <th>{{ $t("moderation.users.tableActions") }}</th>
                </tr>
              </thead>
            <tbody>
              <tr v-for="userRow in usersData?.items || []" :key="userRow.id">
                <td>
                  <div class="font-medium">{{ userRow.profileName }}</div>
                  <div class="text-xs opacity-70">{{ userRow.rufname || "-" }}</div>
                </td>
                <td>{{ userRow.communityRole || "-" }}</td>
                <td>{{ userRow.permissionRoles.join(", ") }}</td>
                <td>
                  <div class="flex flex-wrap gap-2">
                    <UiRetroSelect
                      v-model.number="roleSelect[userRow.id]"
                      size="sm"
                      :label="$t('moderation.users.selectRole')"
                     
                    >
                      <option :value="null">{{ $t("moderation.users.selectRole") }}</option>
                      <option v-for="role in roleData?.communityRoles || []" :key="role.id" :value="role.id">
                        {{ role.name }}
                      </option>
                    </UiRetroSelect>
                    <button class="btn btn-sm btn-primary" @click="changeUserRole(userRow.id)">{{ $t("moderation.actions.apply") }}</button>
                    <button class="btn btn-sm btn-outline" @click="openProfileEditor(userRow)">{{ $t("moderation.actions.editProfile") }}</button>
                    <button class="btn btn-sm btn-outline" @click="triggerSync(userRow.id)">{{ $t("moderation.actions.discordSync") }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'applications'" id="applications" class="card bg-base-200">
      <div class="card-body">
        <h2 class="card-title">{{ $t("moderation.applications") }}</h2>
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
                    <button class="btn btn-xs btn-outline md:btn-sm" @click="openApplicationDetails(application)">{{ $t("moderation.actions.details") }}</button>
                    <button class="btn btn-xs btn-success md:btn-sm" @click="approveApplication(application.userId)">{{ $t("moderation.actions.approve") }}</button>
                    <button class="btn btn-xs btn-error md:btn-sm" @click="rejectApplication(application.userId)">{{ $t("moderation.actions.reject") }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </section>

    <dialog class="modal" :class="{ 'modal-open': confirmState.open }">
      <div class="modal-box bg-surface-2 shadow-neu-raised-lg">
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

    <dialog class="modal" :class="{ 'modal-open': editProfileState.open }">
      <div class="modal-box bg-surface-2 shadow-neu-raised-lg">
        <h3 class="text-lg font-semibold">{{ $t("moderation.profileEditor.title") }}</h3>
        <div class="mt-4 grid gap-3">
          <UiRetroInput
            v-model="editProfileState.ingameName"
            :label="$t('profile.ingameName')"
            type="text"
           
          />
          <UiRetroInput
            v-model="editProfileState.rufname"
            :label="$t('profile.rufname')"
            type="text"
           
          />
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" type="button" @click="closeProfileEditor">{{ $t("common.cancel") }}</button>
          <button class="btn btn-primary" type="button" @click="saveProfileEdit">{{ $t("common.save") }}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="closeProfileEditor">{{ $t("common.close") }}</button>
      </form>
    </dialog>

    <dialog class="modal" :class="{ 'modal-open': !!selectedApplication }">
      <div v-if="selectedApplication" class="modal-box max-w-3xl bg-surface-2 shadow-neu-raised-lg">
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
  </div>
</template>
