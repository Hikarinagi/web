<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'

  const route = useRoute()
  const footerMode = computed(() => route.meta.footer)
  const fluid = computed(() => route.meta.container === 'full')
  const showBottomBar = computed(() => route.meta.bottomBar !== false)

  const shellClass = computed(() =>
    cn(
      'min-h-screen',
      showBottomBar.value &&
        'pb-[calc(var(--app-bottombar-height)+env(safe-area-inset-bottom))] md:pb-0',
    ),
  )
  const mainClass = computed(() =>
    cn('flex-1 pt-(--app-header-height)', !fluid.value && 'mx-auto w-full max-w-app px-4 sm:px-6'),
  )
</script>

<template>
  <Stack gap="none" :class="shellClass">
    <LayoutAppHeader :flush="route.meta.headerFlush === true" />
    <Stack as="main" gap="none" :class="mainClass">
      <slot />
    </Stack>
    <LayoutAppFooter
      v-if="footerMode !== false"
      :class="footerMode === 'desktop' ? 'hidden md:block' : null"
    />
    <LayoutBottomBar v-if="showBottomBar" />
  </Stack>
</template>
