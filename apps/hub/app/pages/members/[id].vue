<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const localePath = useLocalePath();
const memberId = typeof route.params.id === "string" ? route.params.id : "";

await navigateTo(
  localePath({
    path: "/members",
    query: {
      member: memberId
    }
  }),
  {
    redirectCode: 301
  }
);
</script>
