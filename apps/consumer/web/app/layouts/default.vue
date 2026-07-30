<script setup lang="ts">
  const route = useRoute()
  const footerMode = computed(() => route.meta.footer)
  const fluid = computed(() => route.meta.container === 'full')
  const showBottomBar = computed(() => route.meta.bottomBar !== false)
</script>

<template>
  <div
    class="flex min-h-screen flex-col"
    :class="
      showBottomBar
        ? 'pb-[calc(var(--app-bottombar-height)+env(safe-area-inset-bottom))] md:pb-0'
        : null
    "
  >
    <LayoutAppHeader />
    <main
      class="flex-1 pt-(--app-header-height)"
      :class="fluid ? null : 'mx-auto w-full max-w-app px-4 sm:px-6'"
    >
      <slot />
    </main>
    <LayoutAppFooter
      v-if="footerMode !== false"
      :class="footerMode === 'desktop' ? 'hidden md:block' : null"
    />
    <LayoutBottomBar v-if="showBottomBar" />
  </div>
</template>
