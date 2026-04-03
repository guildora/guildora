<script setup lang="ts">
definePageMeta({
  middleware: ["landing"],
});

const lastPath = useCookie<string | null>("guildora_landing_last_path", { sameSite: "lax" });
const allowedTargets = new Set(["/landing/editor", "/landing/settings", "/landing/footer"]);
const target = allowedTargets.has(lastPath.value || "") ? lastPath.value || "/landing/editor" : "/landing/editor";

await navigateTo(target, { redirectCode: 302 });
</script>
