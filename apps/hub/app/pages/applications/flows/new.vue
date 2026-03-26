<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

// Redirect to the flows list — creation happens inline there
await navigateTo("/applications/flows", { redirectCode: 302 });
</script>
