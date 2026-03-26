<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

const lastPath = useCookie<string | null>("guildora_mod_last_path", { sameSite: "lax" });
const allowedTargets = new Set(["/mod/users", "/mod/applications"]);
const target = allowedTargets.has(lastPath.value || "") ? lastPath.value || "/mod/users" : "/mod/users";

await navigateTo(target, { redirectCode: 302 });
</script>
