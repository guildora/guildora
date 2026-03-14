<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "outline" | "info" | "success" | "warning" | "error" | "errorOutline";
    size?: "md" | "sm" | "xs";
    iconOnly?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "md",
    iconOnly: false,
    type: "button"
  }
);

const classes = computed(() => {
  let variantClasses: string | string[] = "btn-primary";
  if (props.variant === "secondary") {
    variantClasses = "btn-secondary";
  } else if (props.variant === "ghost") {
    variantClasses = "btn-ghost";
  } else if (props.variant === "outline") {
    variantClasses = "btn-outline";
  } else if (props.variant === "info") {
    variantClasses = "btn-info";
  } else if (props.variant === "success") {
    variantClasses = "btn-success";
  } else if (props.variant === "warning") {
    variantClasses = "btn-warning";
  } else if (props.variant === "error") {
    variantClasses = "btn-error";
  } else if (props.variant === "errorOutline") {
    variantClasses = ["btn-error", "btn-outline"];
  }

  const base = ["btn", ...(Array.isArray(variantClasses) ? variantClasses : [variantClasses])];
  if (props.size === "sm") base.push("btn-sm");
  if (props.size === "xs") base.push("btn-xs");
  if (props.iconOnly) base.push("btn-circle", "px-0");
  return base;
});
</script>

<template>
  <button :type="type" :class="classes">
    <slot />
  </button>
</template>
