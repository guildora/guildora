<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const lastPath = useCookie<string | null>("newguild_profile_last_path", { sameSite: "lax" });
const allowedTargets = new Set(["/profile/design", "/profile/name", "/profile/roles"]);
const fallback = "/profile/design";
const target = allowedTargets.has(lastPath.value || "") ? (lastPath.value || fallback) : fallback;

await navigateTo(target, { redirectCode: 302 });
</script>
