<script setup lang="ts">
  import { Button, Divider, Empty, Inline, Link, Panel, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { BackendHistoryRow } from '~/features/creator/entry/contract'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'CreatorEntryRecent' })
  defineProps<{
    rows: BackendHistoryRow[]
    historyTo: string
    revisionTo: (revision: number) => string | null
  }>()
</script>

<template>
  <Panel title="最近编辑">
    <template #actions>
      <Button :as="NuxtLink" :to="historyTo" variant="ghost" tone="neutral" size="xs">
        全部历史
      </Button>
    </template>
    <Stack v-if="rows.length" gap="md">
      <template v-for="(row, index) in rows" :key="row.revision ?? `old-${index}`">
        <Divider v-if="index" />
        <Stack gap="xs">
          <Inline gap="sm" align="center" :wrap="false">
            <Avatar :user="row.editor" class="size-6!" />
            <UserName :user="row.editor" class="min-w-0 text-xs" />
          </Inline>
          <Link
            v-if="row.revision !== null && revisionTo(row.revision)"
            :as="NuxtLink"
            :to="revisionTo(row.revision)!"
            class="text-sm"
            :class="row.reverted ? 'line-through' : undefined"
          >
            {{ row.summary }}
          </Link>
          <Text v-else as="p" size="sm">{{ row.summary }}</Text>
          <Inline gap="sm" align="center">
            <Text as="span" size="xs" tone="muted">{{ revisionTime(row.created_at) }}</Text>
            <Tag v-if="row.reverted" tone="neutral">已撤销</Tag>
          </Inline>
        </Stack>
      </template>
    </Stack>
    <Empty v-else size="sm" title="暂无编辑" />
  </Panel>
</template>
