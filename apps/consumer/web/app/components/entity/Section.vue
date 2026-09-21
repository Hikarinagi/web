<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'EntitySection' })
  defineProps<{
    title: string
    meta?: string | null
    moreTo?: string | null
    moreText?: string
  }>()
</script>

<template>
  <Stack as="section">
    <Inline align="baseline" :wrap="false">
      <Heading :level="2" size="2xl">{{ title }}</Heading>
      <Text v-if="meta" size="sm" tone="muted">{{ meta }}</Text>
      <ViewAllLink v-if="moreTo" :to="moreTo" class="ms-auto">
        {{ moreText ?? '查看全部' }}
      </ViewAllLink>
    </Inline>
    <slot />
  </Stack>
</template>
