<script setup lang="ts">
  import { Divider, Inline, Link, Panel, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import { relationPhrase } from '~/features/wiki/values'

  defineOptions({ name: 'WikiWorkRelations' })

  const props = defineProps<{ work: EditableEntry }>()
  const editor = inject(ENTRY_EDITOR)!
  const definition = computed(() => editor.definitions.value.get(props.work.type))
  const field = (property: string) =>
    definition.value?.properties.find(item => item.property === property)
  const relation = computed(() =>
    props.work.type === 'GAME' ? 'GAME_RELATION' : 'SERIES_RELATION',
  )

  const { data, status } = useHikariApiData('/api/v3/wiki/entries/{id}/references', {
    key: `wiki-entry-references-${props.work.id}`,
    path: { id: props.work.id },
    lazy: true,
    server: false,
    toast: false,
  })
  const incoming = computed(() =>
    (data.value ?? [])
      .filter(group => group.property === relation.value || group.property === 'ADAPTATION')
      .flatMap(group => group.items.map(item => ({ ...item, property: group.property }))),
  )
  const phrase = (item: (typeof incoming.value)[number]) =>
    item.property === 'ADAPTATION'
      ? '本作是它的改编'
      : item.code
        ? relationPhrase(item.property, item.code, 'self')
        : ''
</script>

<template>
  <Panel title="相关作品">
    <Stack gap="lg">
      <WikiFieldProperty v-if="field(relation)" :entry="work.id" :definition="field(relation)!" />
      <WikiFieldProperty
        v-if="field('ADAPTATION')"
        :entry="work.id"
        :definition="field('ADAPTATION')!"
      />
      <Stack v-if="!data && status !== 'success' && status !== 'error'" gap="sm">
        <Skeleton v-for="index in 2" :key="index" class="h-6" />
      </Stack>
      <template v-else-if="incoming.length">
        <Divider />
        <Stack gap="sm">
          <Inline v-for="item in incoming" :key="item.statement_id" gap="sm" align="baseline">
            <Link
              :as="NuxtLink"
              :to="`/entries/${item.entry.id}/edit/relations`"
              lang="ja"
              class="text-sm"
            >
              {{ item.entry.label }}
            </Link>
            <Text as="span" size="sm" tone="muted">{{ phrase(item) }}</Text>
          </Inline>
        </Stack>
      </template>
    </Stack>
  </Panel>
  <Panel v-if="work.type === 'GAME' && field('CREDIT')" title="非官方汉化">
    <WikiFieldProperty :entry="work.id" :definition="field('CREDIT')!" />
  </Panel>
</template>
