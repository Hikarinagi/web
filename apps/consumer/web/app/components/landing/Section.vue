<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'

  defineOptions({ name: 'LandingSection' })
  defineProps<{ title: string }>()
</script>

<template>
  <Stack as="section" gap="md" class="min-w-0">
    <EntrySectionHead :title="title">
      <template #actions><slot name="actions" /></template>
    </EntrySectionHead>
    <slot />
  </Stack>
</template>
