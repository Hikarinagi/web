<script setup lang="ts">
  import { Empty, Heading, Inline, Space, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'WorkSection' })
  defineProps<{
    title: string
    meta?: string
    empty?: boolean
    emptyText?: string
    hideWhenEmpty?: boolean
  }>()
</script>

<template>
  <Stack v-if="!(empty && hideWhenEmpty)" as="section">
    <Inline align="baseline" :wrap="false">
      <Heading :level="2" size="2xl">{{ title }}</Heading>
      <Text v-if="meta" size="sm" tone="muted">{{ meta }}</Text>
      <template v-if="$slots.action">
        <Space />
        <slot name="action" />
      </template>
    </Inline>

    <slot v-if="!empty" />
    <slot v-else name="empty">
      <Empty :title="emptyText ?? '还没有内容'" />
    </slot>
  </Stack>
</template>
