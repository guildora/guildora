<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
});

await navigateTo("/admin/design", { redirectCode: 302 });
</script>
