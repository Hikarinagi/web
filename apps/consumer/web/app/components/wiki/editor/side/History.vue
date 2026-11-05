<script setup lang="ts">
  import { Empty, Inline, Link, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { changeLines } from '~/features/wiki/changes'

  defineOptions({ name: 'WikiEditorSideHistory' })

  const props = defineProps<{ entry: number }>()
  const { data, status } = useHikariApiData('/api/v3/wiki/changes', {
    key: `wiki-entry-changes-${props.entry}`,
    query: { within: props.entry, content: true, page: 1, page_size: 20 },
    lazy: true,
    server: false,
    toast: false,
  })
</script>

<template>
  <Stack v-if="!data && status !== 'success' && status !== 'error'" gap="md">
    <Skeleton v-for="index in 4" :key="index" class="h-12" />
  </Stack>
  <Empty v-else-if="!data?.items.length" title="暂无修改记录" />
  <Stack v-else gap="md">
    <Stack v-for="change in data.items" :key="change.id" gap="xs" class="min-w-0">
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
        <Avatar :user="change.editor" size="sm" />
        <UserName :user="change.editor" class="text-sm" />
      </Inline>
      <Link
        :as="NuxtLink"
        :to="`/create/wiki/changes/${change.id}`"
        tone="neutral"
        class="line-clamp-3 text-sm"
      >
        {{
          change.note ??
          changeLines(change)
            .map(line => line.text)
            .join('；')
        }}
      </Link>
      <Text size="xs" tone="muted">{{ revisionTime(change.created_at) }}</Text>
    </Stack>
    <Link :as="NuxtLink" :to="`/entries/${entry}/history`" class="text-sm">全部修改记录</Link>
  </Stack>
</template>
