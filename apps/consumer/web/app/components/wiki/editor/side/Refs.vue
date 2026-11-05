<script setup lang="ts">
  import { Empty, Heading, Link, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { EntryDefinition } from '~/features/wiki/editor/draft'
  import { referenceSections } from '~/features/wiki/references'

  defineOptions({ name: 'WikiEditorSideRefs' })

  const props = defineProps<{ entry: number; type: string; definitions: EntryDefinition[] }>()
  const { data, status } = useHikariApiData('/api/v3/wiki/entries/{id}/references', {
    key: `wiki-entry-references-${props.entry}`,
    path: { id: props.entry },
    lazy: true,
    server: false,
    toast: false,
  })
  const sections = computed(() =>
    referenceSections(data.value ?? [], props.type, props.definitions),
  )
</script>

<template>
  <Stack v-if="!data && status !== 'success' && status !== 'error'" gap="md">
    <Skeleton v-for="index in 3" :key="index" class="h-16" />
  </Stack>
  <Empty v-else-if="!sections.length" title="暂无相关条目" />
  <Stack v-else gap="lg">
    <Stack v-for="section in sections" :key="section.key" gap="xs">
      <Heading :level="3" size="xs">
        {{ section.title }}
        <Text as="span" size="xs" tone="muted">{{ section.total }}</Text>
      </Heading>
      <Stack gap="sm">
        <Stack v-for="row in section.rows" :key="row.key" gap="none" class="min-w-0">
          <Link :as="NuxtLink" :to="row.to" class="truncate text-sm" lang="ja">
            {{ row.label }}
          </Link>
          <Text v-if="row.sub" size="xs" tone="muted" lang="ja" truncate>{{ row.sub }}</Text>
        </Stack>
      </Stack>
    </Stack>
  </Stack>
</template>
