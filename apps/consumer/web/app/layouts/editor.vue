<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
</script>

<template>
  <Stack gap="none" class="min-h-screen">
    <LayoutAppHeader flush />
    <Stack
      as="main"
      gap="none"
      class="min-h-[calc(100vh-var(--app-header-height))] pt-(--app-header-height)"
    >
      <slot />
    </Stack>
  </Stack>
</template>
