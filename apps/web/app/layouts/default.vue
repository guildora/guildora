<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main class="flex-1 container mx-auto px-4 py-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
