<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

const lastPath = useCookie<string | null>("guildora_applications_last_path", { sameSite: "lax" });
const allowedTargets = new Set(["/applications/flows", "/applications/open", "/applications/archive", "/applications/config"]);
const target = allowedTargets.has(lastPath.value || "") ? lastPath.value || "/applications/flows" : "/applications/flows";

await navigateTo(target, { redirectCode: 302 });
</script>
