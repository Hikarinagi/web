<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
</script>

<template>
  <Stack as="main" gap="none" class="h-dvh overflow-hidden bg-canvas">
    <slot />
  </Stack>
</template>
