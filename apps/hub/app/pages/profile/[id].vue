<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const localePath = useLocalePath();

await navigateTo(localePath(`/members/${route.params.id}`), {
  redirectCode: 301
});
</script>
