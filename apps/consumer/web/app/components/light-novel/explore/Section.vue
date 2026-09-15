<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'LightNovelExploreSection' })
  withDefaults(
    defineProps<{
      title: string
      meta?: string
      to?: string
      gap?: 'normal' | 'loose'
    }>(),
    { gap: 'normal', meta: undefined, to: undefined },
  )
</script>

<template>
  <Stack as="section" :gap="gap === 'loose' ? 'lg' : 'md'">
    <Inline align="baseline" :wrap="false">
      <Heading :level="2" size="2xl">{{ title }}</Heading>
      <Text v-if="meta" size="sm" tone="muted">{{ meta }}</Text>
      <ViewAllLink v-if="to" :to="to" class="ms-auto" />
    </Inline>
    <slot />
  </Stack>
</template>
