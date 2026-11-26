<script setup lang="ts">
  import { Button, Card, Empty, Grid, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft, RotateCcw } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendEntryComparison } from '~/features/entry/contract'
  import {
    REVISION_RESOURCE_BASE_PATH,
    type RevisionResourceSlug,
  } from '~/features/revision/resources'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'EntryHistoryComparison' })
  defineProps<{
    resource: RevisionResourceSlug
    resourceId: number
    title: string
    comparison: BackendEntryComparison
  }>()
</script>

<template>
  <Stack gap="lg" class="mx-auto max-w-app px-6 py-10">
    <Inline align="center" justify="between" gap="sm" wrap>
      <Button
        :as="NuxtLink"
        :to="`${REVISION_RESOURCE_BASE_PATH[resource]}/${resourceId}/revisions`"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #icon><ArrowLeft /></template>
        返回
      </Button>
      <Inline gap="sm" align="center">
        <RotateCcw class="size-4 text-muted" aria-hidden="true" />
        <Text as="span" size="sm" tone="muted">{{ title }} 的修订历史</Text>
      </Inline>
    </Inline>
    <Card :padded="false" class="overflow-hidden">
      <Grid :cols="2" gap="none" class="divide-x divide-line border-b border-line bg-subtle">
        <Stack
          v-for="(side, index) in [comparison.from, comparison.to]"
          :key="index"
          gap="xs"
          class="px-4 py-3"
        >
          <Text size="sm" weight="semibold">
            {{ index ? '之后' : '之前' }}：{{ revisionTime(side.created_at) }} 的修订
          </Text>
          <Inline gap="sm" align="center" :wrap="false" class="min-w-0 text-sm">
            <Avatar :user="side.editor" size="sm" />
            <UserName :user="side.editor" class="shrink-0" />
            <Text as="span" size="sm" tone="muted" truncate class="min-w-0 flex-1">
              {{ side.summary }}
            </Text>
          </Inline>
        </Stack>
      </Grid>
      <Empty v-if="!comparison.entries.length" size="sm" title="两条修订在本页的内容相同" />
      <EntryHistoryComparisonEntry
        v-for="entry in comparison.entries"
        :key="entry.id"
        :entry="entry"
      />
    </Card>
  </Stack>
</template>
