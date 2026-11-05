<script setup lang="ts">
  import { Empty, Heading, Link, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { EntryDefinition } from '~/features/wiki/editor/draft'
  import { referenceTitle } from '~/features/wiki/references'

  defineOptions({ name: 'WikiEditorSideRefs' })

  const props = defineProps<{ entry: number; definitions: EntryDefinition[] }>()
  const { data, status } = useHikariApiData('/api/v3/wiki/entries/{id}/references', {
    key: `wiki-entry-references-${props.entry}`,
    path: { id: props.entry },
    lazy: true,
    server: false,
    toast: false,
  })
</script>

<template>
  <Stack v-if="!data && status !== 'success' && status !== 'error'" gap="md">
    <Skeleton v-for="index in 3" :key="index" class="h-16" />
  </Stack>
  <Empty v-else-if="!data?.length" title="暂无指向本条目的条目" />
  <Stack v-else gap="lg">
    <Stack v-for="group in data" :key="`${group.type}:${group.property}`" gap="xs">
      <Heading :level="3" size="xs">
        {{ referenceTitle(group, definitions) }}
        <Text as="span" size="xs" tone="muted">{{ group.total }}</Text>
      </Heading>
      <Stack gap="xs">
        <Stack v-for="item in group.items" :key="item.statement_id" gap="none" class="min-w-0">
          <Link
            :as="NuxtLink"
            :to="`/entries/${item.entry.id}/edit`"
            tone="neutral"
            class="truncate text-sm"
            lang="ja"
          >
            {{ item.entry.label || '未命名' }}
          </Link>
          <Text v-if="item.works.length || item.credits.length" size="xs" tone="muted" truncate>
            {{ [...item.works, ...item.credits].join('、') }}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  </Stack>
</template>
