<script setup lang="ts">
  import { Button, Empty, Heading, Inline, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import { dateText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiSeriesVolumes' })

  const props = defineProps<{ series: EditableEntry; volume: number | null; book: number | null }>()
  const editor = inject(ENTRY_EDITOR)!
  const parts = useEditorParts(editor, () => ({
    id: props.series.id,
    type: props.series.type,
    label: props.series.label,
  }))
  const base = computed(() => `/entries/${props.series.id}/edit/volumes`)
  const volumes = computed(() => parts.entriesOf('VOLUME'))
  const booksOf = (volume: number) =>
    parts
      .entriesOf('BOOK')
      .filter(book => parts.first(book.id, 'INCLUDED_VOLUME')?.target?.id === volume)
  const current = computed(() => volumes.value.find(item => item.id === props.volume) ?? null)
  const books = computed(() => (current.value ? booksOf(current.value.id) : []))
  const chosen = computed(() => books.value.find(item => item.id === props.book) ?? null)
  const titleOf = (id: number, fallback: string) => parts.first(id, 'TITLE')?.text || fallback
  const coverOf = (volume: number) =>
    booksOf(volume)
      .map(book => parts.first(book.id, 'COVER')?.media ?? null)
      .find(Boolean) ?? null
  const definition = (type: 'VOLUME' | 'BOOK') => editor.definitions.value.get(type)
  const releasedOf = (book: number) => {
    const date = parts.first(book, 'RELEASE_DATE')
    return date?.date ? dateText(date.date, date.date_precision) : ''
  }

  function addVolume() {
    const id = parts.create('VOLUME', [
      ['SERIES', { target: { id: props.series.id, type: 'SERIES', label: props.series.label } }],
      ['TITLE', {}],
    ])
    void navigateTo(`${base.value}/${id}`)
  }

  function addBook(volume: number) {
    const id = parts.create('BOOK', [
      ['INCLUDED_VOLUME', { target: { id: volume, type: 'VOLUME', label: titleOf(volume, '') } }],
      ['TITLE', { text: titleOf(volume, '') }],
    ])
    void navigateTo(`${base.value}/${volume}/${id}`)
  }
</script>

<template>
  <Stack gap="lg">
    <Inline gap="sm" align="center" justify="between">
      <Text size="sm" tone="muted">{{ volumes.length }} 卷</Text>
      <Button size="sm" @click="addVolume">
        <template #icon><Plus /></template>
        新建卷
      </Button>
    </Inline>
    <Empty v-if="!volumes.length" title="还没有卷" />
    <SimpleGrid v-else min="14rem" gap="sm">
      <WikiEditorEntryCard
        v-for="item in volumes"
        :key="item.id"
        :to="`${base}/${item.id}`"
        :active="item.id === volume"
        :created="item.id < 0"
        :title="titleOf(item.id, '未命名的卷')"
        :facts="parts.first(item.id, 'VOLUME_NUMBER')?.text ?? ''"
        :cover="coverOf(item.id)"
      />
    </SimpleGrid>
    <Stack v-if="current && definition('VOLUME')" gap="lg">
      <Heading :level="2" size="sm" lang="ja">{{ titleOf(current.id, '未命名的卷') }}</Heading>
      <WikiEditorForm :entry="current" :definition="definition('VOLUME')!" />
      <Inline gap="sm" align="center" justify="between">
        <Text size="sm" tone="muted">{{ books.length }} 个出版版本</Text>
        <Button variant="outline" tone="neutral" size="sm" @click="addBook(current.id)">
          <template #icon><Plus /></template>
          新建出版版本
        </Button>
      </Inline>
      <SimpleGrid v-if="books.length" min="14rem" gap="sm">
        <WikiEditorEntryCard
          v-for="item in books"
          :key="item.id"
          :to="`${base}/${current.id}/${item.id}`"
          :active="item.id === book"
          :created="item.id < 0"
          :title="titleOf(item.id, '未命名的出版版本')"
          :facts="releasedOf(item.id)"
          :cover="parts.first(item.id, 'COVER')?.media ?? null"
        />
      </SimpleGrid>
      <Stack v-if="chosen && definition('BOOK')" gap="lg">
        <Heading :level="3" size="xs" lang="ja">{{
          titleOf(chosen.id, '未命名的出版版本')
        }}</Heading>
        <WikiEditorForm :entry="chosen" :definition="definition('BOOK')!" />
      </Stack>
    </Stack>
  </Stack>
</template>
