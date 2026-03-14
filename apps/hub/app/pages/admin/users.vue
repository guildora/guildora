<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
});

await navigateTo("/admin/dev-role-switcher", { redirectCode: 302 });
</script>
