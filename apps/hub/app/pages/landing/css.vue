<script setup lang="ts">
definePageMeta({ middleware: ["landing"] });
await navigateTo("/landing/settings", { redirectCode: 301 });
</script>
