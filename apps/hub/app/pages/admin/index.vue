<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
});

const lastPath = useCookie<string | null>("guildora_admin_last_path", { sameSite: "lax" });
const allowedTargets = new Set(["/admin/design", "/admin/permissions", "/admin/discord-roles", "/admin/apps", "/admin/dev-role-switcher"]);
const target = allowedTargets.has(lastPath.value || "") ? lastPath.value || "/admin/design" : "/admin/design";

await navigateTo(target, { redirectCode: 302 });
</script>
