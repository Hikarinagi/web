<script setup lang="ts">
  import { Button, Divider, Empty, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'CreatorOverviewChanges' })
  defineProps<{
    title: string
    list: ApiData<'/api/v3/wiki/changes', 'get'>
    emptyText: string
    editor?: boolean
  }>()
</script>

<template>
  <Panel :title="title" :count="list.meta.total_items">
    <template #actions>
      <Button :as="NuxtLink" to="/create/edits" variant="ghost" tone="neutral" size="xs">
        查看全部
      </Button>
    </template>
    <Stack v-if="list.items.length" gap="sm">
      <template v-for="(row, index) in list.items" :key="row.id">
        <Divider v-if="index" />
        <Stack gap="xs">
          <Inline gap="sm" align="baseline" :wrap="false">
            <Link
              v-for="entry in row.entries.slice(0, 1)"
              :key="entry.id"
              :as="NuxtLink"
              :to="`/create/edit/entry/${entry.id}`"
              class="min-w-0 truncate text-sm"
              lang="ja"
            >
              {{ entry.label }}
            </Link>
            <Text as="span" size="xs" tone="muted" class="ms-auto shrink-0">
              {{ revisionTime(row.created_at) }}
            </Text>
          </Inline>
          <Inline gap="sm" align="center" :wrap="false">
            <template v-if="editor">
              <Avatar :user="row.editor" class="size-5!" />
              <UserName :user="row.editor" class="shrink-0 text-xs" />
            </template>
            <Text as="span" size="sm" tone="muted" truncate>{{ row.summary }}</Text>
          </Inline>
        </Stack>
      </template>
    </Stack>
    <Empty v-else size="sm" :title="emptyText" />
  </Panel>
</template>
