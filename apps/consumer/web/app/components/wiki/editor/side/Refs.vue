<script setup lang="ts">
  import { Empty, Heading, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { EntryDefinition } from '~/features/wiki/editor/draft'
  import { ENTRY_PAGE } from '~/features/wiki/editor/page'
  import { referenceSections } from '~/features/wiki/references'

  defineOptions({ name: 'WikiEditorSideRefs' })

  const props = defineProps<{ type: string; definitions: EntryDefinition[] }>()
  const page = inject(ENTRY_PAGE)!
  const sections = computed(() =>
    referenceSections(page.references.value, props.type, props.definitions),
  )
</script>

<template>
  <Empty v-if="!sections.length" title="暂无相关条目" />
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
