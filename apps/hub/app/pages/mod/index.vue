<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

const lastPath = useCookie<string | null>("guildora_mod_last_path", { sameSite: "lax" });
const target = "/mod/users";

await navigateTo(target, { redirectCode: 302 });
</script>
