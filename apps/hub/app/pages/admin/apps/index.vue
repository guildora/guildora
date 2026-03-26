<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
});

await navigateTo("/apps", { redirectCode: 301 });
</script>
