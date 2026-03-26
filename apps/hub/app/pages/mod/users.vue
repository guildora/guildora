<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

const lastPath = useCookie<string | null>("guildora_mod_last_path", { sameSite: "lax" });
lastPath.value = "/mod/users";

const { t } = useI18n();

interface CommunityRoleItem {
  id: number;
  name: string;
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

const search = ref("");
const selectedRoleFilter = ref("");

const { data: roleData } = await useFetch<{
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

const roleSelect = reactive<Record<string, number | null>>({});
const actionError = ref<string | null>(null);

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

const changeUserRole = (userId: string) => {
  const roleId = roleSelect[userId];
  if (!roleId) return;
  openConfirm(t("moderation.confirm.changeRoleTitle"), t("moderation.confirm.changeRoleMessage"), async () => {
    actionError.value = null;
    try {
      await $fetch(`/api/mod/users/${userId}/community-role`, {
        method: "PUT",
        body: { communityRoleId: roleId }
      });
      await refreshUsers();
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
    await refreshUsers();
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
  if (!editProfileState.userId) return;
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
    await refreshUsers();
  } catch (e) {
    console.error(e);
    actionError.value = t("moderation.errors.save");
  }
};
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("moderation.userManagement") }}</h1>
      <p class="opacity-80">{{ $t("moderation.description") }}</p>
    </header>

    <div v-if="actionError" class="alert alert-error">
      <span>{{ actionError }}</span>
      <button class="btn btn-ghost btn-sm" type="button" @click="actionError = null">{{ $t("moderation.actions.close") }}</button>
    </div>

    <div class="card bg-base-200">
      <div class="card-body space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <UiInput
            v-model="search"
            :label="$t('moderation.users.searchPlaceholder')"
            type="text"
            :placeholder="$t('moderation.users.searchPlaceholder')"
          />
          <UiSelect v-model="selectedRoleFilter" :label="$t('moderation.users.allRoles')">
            <option value="">{{ $t("moderation.users.allRoles") }}</option>
            <option v-for="role in roleData?.communityRoles || []" :key="role.id" :value="role.name">{{ role.name }}</option>
          </UiSelect>
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
                    <UiSelect
                      v-model.number="roleSelect[userRow.id]"
                      size="sm"
                      :label="$t('moderation.users.selectRole')"
                    >
                      <option :value="null">{{ $t("moderation.users.selectRole") }}</option>
                      <option v-for="role in roleData?.communityRoles || []" :key="role.id" :value="role.id">
                        {{ role.name }}
                      </option>
                    </UiSelect>
                    <button class="btn btn-sm btn-primary" type="button" @click="changeUserRole(userRow.id)">{{ $t("moderation.actions.apply") }}</button>
                    <button class="btn btn-sm btn-outline" type="button" @click="openProfileEditor(userRow)">{{ $t("moderation.actions.editProfile") }}</button>
                    <button class="btn btn-sm btn-outline" type="button" @click="triggerSync(userRow.id)">{{ $t("moderation.actions.discordSync") }}</button>
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

    <dialog class="modal" :class="{ 'modal-open': editProfileState.open }">
      <div class="modal-box bg-surface-2 shadow-lg">
        <h3 class="text-lg font-semibold">{{ $t("moderation.profileEditor.title") }}</h3>
        <div class="mt-4 grid gap-3">
          <UiInput
            v-model="editProfileState.ingameName"
            :label="$t('profile.ingameName')"
            type="text"
          />
          <UiInput
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
  </section>
</template>
