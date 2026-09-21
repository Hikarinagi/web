<template>
  <div class="min-h-screen">
    <LayoutAppHeader flush />
    <main class="min-h-[calc(100vh-var(--app-header-height))] pt-(--app-header-height)">
      <slot />
    </main>
  </div>
</template>
