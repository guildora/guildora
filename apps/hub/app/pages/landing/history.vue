<script setup lang="ts">
definePageMeta({ middleware: ["landing"] });
await navigateTo("/landing/editor", { redirectCode: 301 });
</script>
