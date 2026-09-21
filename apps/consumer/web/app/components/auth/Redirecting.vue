<script setup lang="ts">
  import { Spinner, Stack, Text } from '@hina-ui/vue'
  defineProps<{ text: string }>()
</script>

<template>
  <Stack
    as="section"
    gap="none"
    align="center"
    class="mx-auto min-h-[calc(100vh-var(--app-header-height))] w-full max-w-md justify-center gap-3 px-4 py-10"
  >
    <Spinner size="lg" label="正在跳转" />
    <Text size="sm" tone="muted">{{ text }}</Text>
  </Stack>
</template>
