<script setup lang="ts">
  import { Button, Heading, Inline, Link, Panel, SimpleGrid, Stack } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { entryState, type EditableEntry } from '~/features/wiki/editor/draft'
  import { codeLabel, dateText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiSeriesVolume' })

  const props = defineProps<{
    series: EditableEntry
    volume: Pick<EditableEntry, 'id' | 'type'>
    book: number | null
  }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const nav = usePageNav()
  const parts = useEditorParts(editor, () => ({
    id: props.series.id,
    type: props.series.type,
    label: props.series.label,
  }))
  const base = computed(() => `/entries/${props.series.id}/edit/volumes/${props.volume.id}`)
  const books = computed(() =>
    parts
      .entriesOf('BOOK')
      .filter(item => parts.first(item.id, 'INCLUDED_VOLUME')?.target?.id === props.volume.id),
  )
  const chosen = computed(() => books.value.find(item => item.id === props.book) ?? null)
  const definition = (type: 'VOLUME' | 'BOOK') => editor.definitions.value.get(type)
  const titleOf = (id: number, fallback: string) => parts.first(id, 'TITLE')?.text || fallback
  const owner = (statement: number) => editor.statements.value.get(statement)?.entry
  const stateOf = (id: number) => entryState(editor.draft.value, owner, id)
  const factsOf = (id: number) => {
    const format = parts.first(id, 'BOOK_FORMAT')?.code
    const date = parts.first(id, 'RELEASE_DATE')
    const line = [
      format ? codeLabel('BOOK_FORMAT', format) : '',
      date?.date ? dateText(date.date, date.date_precision) : '',
    ]
      .filter(Boolean)
      .join('，')
    return line || parts.first(id, 'ISBN')?.text || ''
  }

  function addBook() {
    const id = parts.create('BOOK', [
      [
        'INCLUDED_VOLUME',
        { target: { id: props.volume.id, type: 'VOLUME', label: titleOf(props.volume.id, '') } },
      ],
      ['TITLE', { text: titleOf(props.volume.id, '') }],
    ])
    void nav.push({ path: `${base.value}/${id}`, query: route.query })
  }

  function drop(id: number, to: string) {
    editor.uncreate(id)
    void nav.push({ path: to, query: route.query })
  }
</script>

<template>
  <Stack gap="lg">
    <Inline gap="md" align="center" justify="between" :wrap="false">
      <Heading :level="2" size="sm" lang="ja" class="min-w-0 truncate">
        {{ titleOf(volume.id, '新的卷') }}
      </Heading>
      <Button
        v-if="volume.id < 0"
        size="sm"
        variant="ghost"
        tone="neutral"
        @click="drop(volume.id, `/entries/${series.id}/edit/volumes`)"
      >
        取消新建
      </Button>
      <Link v-else :as="NuxtLink" :to="`/entries/${volume.id}/history`" class="shrink-0 text-sm">
        此卷的修改记录
      </Link>
    </Inline>
    <WikiEditorForm
      v-if="definition('VOLUME')"
      :entry="volume"
      :definition="definition('VOLUME')!"
      :columns="2"
    />
    <Panel title="出版版本" :count="books.length">
      <template #actions>
        <Button size="sm" variant="ghost" @click="addBook">
          <template #icon><Plus /></template>
          新建出版版本
        </Button>
      </template>
      <SimpleGrid min="14rem" gap="sm">
        <WikiEditorEntryCard
          v-for="item in books"
          :key="item.id"
          :to="{ path: `${base}/${item.id}`, query: route.query }"
          :active="item.id === book"
          :state="stateOf(item.id)"
          :title="titleOf(item.id, '新的出版版本')"
          :facts="factsOf(item.id)"
          empty="暂无发售日"
          :cover="parts.first(item.id, 'COVER')?.media ?? null"
        />
      </SimpleGrid>
    </Panel>
    <Stack v-if="chosen && definition('BOOK')" gap="lg">
      <Inline gap="md" align="center" justify="between" :wrap="false">
        <Heading :level="3" size="xs" lang="ja" class="min-w-0 truncate">
          {{ titleOf(chosen.id, '新的出版版本') }}
        </Heading>
        <Button
          v-if="chosen.id < 0"
          size="sm"
          variant="ghost"
          tone="neutral"
          @click="drop(chosen.id, base)"
        >
          取消新建
        </Button>
        <Link v-else :as="NuxtLink" :to="`/entries/${chosen.id}/history`" class="shrink-0 text-sm">
          此出版版本的修改记录
        </Link>
      </Inline>
      <WikiEditorForm :entry="chosen" :definition="definition('BOOK')!" :columns="2" />
    </Stack>
  </Stack>
</template>
