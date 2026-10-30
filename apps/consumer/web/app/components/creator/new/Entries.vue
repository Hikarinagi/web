<script setup lang="ts">
  import { Button, Divider, Empty, Inline, Link, Panel, Stack, Tag } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_TYPE_NAMES, type BackendEntryLookup } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorNewEntries' })
  defineProps<{
    title: string
    entries: BackendEntryLookup['matches']
    edit?: boolean
    emptyText?: string
  }>()

  const names = inject(
    ENTRY_TYPE_NAMES,
    computed<Record<string, string>>(() => ({})),
  )
</script>

<template>
  <Panel :title="title" :count="entries.length">
    <Stack gap="sm">
      <Empty v-if="!entries.length" size="sm" :title="emptyText" />
      <template v-for="(entry, index) in entries" :key="entry.id">
        <Divider v-if="index" />
        <Inline gap="md" align="center" justify="between" :wrap="false">
          <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
            <Tag tone="neutral" class="shrink-0">{{ names[entry.type] ?? entry.type }}</Tag>
            <Link
              :as="NuxtLink"
              :to="`/create/edit/entry/${entry.id}`"
              class="min-w-0 truncate text-sm"
              lang="ja"
            >
              {{ entry.label }}
            </Link>
          </Inline>
          <Button
            v-if="edit"
            :as="NuxtLink"
            :to="`/create/edit/entry/${entry.id}`"
            size="sm"
            class="shrink-0"
          >
            编辑此条目
          </Button>
        </Inline>
      </template>
      <slot />
    </Stack>
  </Panel>
</template>
