<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft, RotateCcw, SquarePen } from '@lucide/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'EntryHistoryHeader' })
  defineProps<{
    to: string
    editTo: string
    title: string
    subtitle: string | null
    total: number
  }>()
</script>

<template>
  <Stack as="header" gap="md" class="border-b border-line pb-6">
    <Inline gap="sm" align="center" justify="between" wrap>
      <Button :as="NuxtLink" :to="to" variant="outline" tone="neutral" size="sm">
        <template #icon><ArrowLeft /></template>
        返回详情
      </Button>
      <Button
        :as="NuxtLink"
        :to="editTo"
        target="_blank"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #icon><SquarePen /></template>
        修订此条目
      </Button>
    </Inline>
    <Stack gap="xs" align="start">
      <Inline gap="sm" align="center">
        <RotateCcw class="size-4 text-muted" aria-hidden="true" />
        <Text as="span" size="sm" tone="muted">{{ title }} 的修订历史</Text>
      </Inline>
      <Heading :level="1" size="2xl">{{ title }}</Heading>
      <Text v-if="subtitle" size="sm" tone="muted" lang="ja">{{ subtitle }}</Text>
      <Text size="sm" tone="muted">共 {{ total }} 条修订记录</Text>
    </Stack>
  </Stack>
</template>
