<script setup lang="ts">
  import { Empty, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { changeLines } from '~/features/wiki/changes'
  import { ENTRY_PAGE } from '~/features/wiki/editor/page'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorSideHistory' })

  const page = inject(ENTRY_PAGE)!
</script>

<template>
  <Empty v-if="!page.history.value.length" title="暂无修改记录" />
  <Stack v-else gap="none">
    <Stack
      v-for="change in page.history.value"
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
