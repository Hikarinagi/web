<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'MangaHomeSection' })
  defineProps<{
    title: string
    meta?: string
    to?: string
  }>()
</script>

<template>
  <Stack as="section" gap="md">
    <Inline align="baseline" :wrap="false">
      <Heading :level="2" size="2xl">{{ title }}</Heading>
      <Text v-if="meta" size="sm" tone="muted">{{ meta }}</Text>
      <slot name="actions">
        <ViewAllLink v-if="to" :to="to" class="ms-auto" />
      </slot>
    </Inline>
    <slot />
  </Stack>
</template>
