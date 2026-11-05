<script setup lang="ts">
  import { Empty, Inline, Link, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { changeLines } from '~/features/wiki/changes'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorSideHistory' })

  const props = defineProps<{ entry: number }>()
  const { data, status, refresh } = useHikariApiData('/api/v3/wiki/changes', {
    key: `wiki-entry-changes-${props.entry}`,
    query: { within: props.entry, content: true, page: 1, page_size: 30 },
    lazy: true,
    server: false,
    toast: false,
  })
  useWikiSavedBus().on(() => void refresh())
</script>

<template>
  <Stack v-if="!data && status !== 'success' && status !== 'error'" gap="md">
    <Skeleton v-for="index in 4" :key="index" class="h-12" />
  </Stack>
  <Empty v-else-if="!data?.items.length" title="暂无修改记录" />
  <Stack v-else gap="none">
    <Stack
      v-for="change in data.items"
      :key="change.id"
      gap="xs"
      class="min-w-0 border-b border-line py-2.5 last:border-b-0"
    >
      <Inline gap="sm" align="center" justify="between" :wrap="false" class="min-w-0">
        <Inline gap="xs" align="center" :wrap="false" class="min-w-0">
          <Avatar :user="change.editor" size="sm" />
          <UserName :user="change.editor" class="text-xs" />
        </Inline>
        <Text size="xs" tone="muted" class="shrink-0">
          {{ change.reverted_at ? '已撤销' : revisionTime(change.created_at) }}
        </Text>
      </Inline>
      <Link
        :as="NuxtLink"
        :to="`/create/wiki/changes/${change.id}`"
        tone="neutral"
        :class="cn('line-clamp-3 text-sm', change.reverted_at && 'text-muted line-through')"
      >
        {{
          change.note ??
          changeLines(change)
            .map(line => line.text)
            .join('；')
        }}
      </Link>
    </Stack>
  </Stack>
</template>
