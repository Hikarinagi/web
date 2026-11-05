<script setup lang="ts">
  import { Empty, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import {
    changeLines,
    changeTitle,
    changesRoute,
    CHANGES_PAGE_SIZE,
    type ChangeFilter,
    type WikiChange,
  } from '~/features/wiki/changes'

  defineOptions({ name: 'WikiHomeChanges' })

  const props = defineProps<{
    title: string
    items: WikiChange[]
    total?: number
    filter: ChangeFilter
    empty: string
  }>()

  const state = computed(() => ({ f: props.filter, page: 1, page_size: CHANGES_PAGE_SIZE }))
  const text = (change: WikiChange) =>
    change.note ??
    changeLines(change)
      .map(line => line.text)
      .join('；')
</script>

<template>
  <Panel :title="title" :count="total">
    <template #actions>
      <Link :as="NuxtLink" :to="changesRoute(state)" class="text-sm">全部</Link>
    </template>
    <Empty v-if="!items.length" :title="empty" />
    <Stack v-else gap="md">
      <Stack v-for="change in items" :key="change.id" gap="xs" class="min-w-0">
        <Inline gap="sm" align="center" justify="between" :wrap="false" class="min-w-0">
          <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
            <Avatar :user="change.editor" size="sm" />
            <UserName :user="change.editor" class="text-sm" />
          </Inline>
          <Text as="span" size="xs" tone="muted" class="shrink-0">
            {{ revisionTime(change.created_at) }}
          </Text>
        </Inline>
        <Link
          :as="NuxtLink"
          :to="changesRoute(state, change.id)"
          tone="neutral"
          class="line-clamp-2 text-sm"
        >
          {{ changeTitle(change) }}：{{ text(change) }}
        </Link>
      </Stack>
    </Stack>
  </Panel>
</template>
