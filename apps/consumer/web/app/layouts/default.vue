<script setup lang="ts">
  import { Container, Stack } from '@hina-ui/vue'

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
    cn('flex-1 pt-(--app-header-height)', fluid.value ? 'max-w-none px-0 sm:px-0' : 'max-w-app'),
  )
</script>

<template>
  <Stack gap="none" :class="shellClass">
    <LayoutAppHeader :flush="route.meta.headerFlush === true" />
    <Container as="main" :class="mainClass">
      <slot />
    </Container>
    <LayoutAppFooter
      v-if="footerMode !== false"
      :class="footerMode === 'desktop' ? 'hidden md:block' : null"
    />
    <LayoutBottomBar v-if="showBottomBar" />
  </Stack>
</template>
