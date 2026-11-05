<script setup lang="ts">
  import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    Empty,
    Heading,
    Inline,
    Link,
    SimpleGrid,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Copy, Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import { codeLabel, dateText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiGameReleases' })

  const props = defineProps<{ game: EditableEntry; selected: number | null }>()
  const editor = inject(ENTRY_EDITOR)!
  const parts = useEditorParts(editor, () => ({
    id: props.game.id,
    type: props.game.type,
    label: props.game.label,
  }))
  const base = computed(() => `/entries/${props.game.id}/edit/releases`)
  const releases = computed(() => parts.entriesOf('PRODUCT'))
  const current = computed(() => releases.value.find(item => item.id === props.selected) ?? null)
  const definition = computed(() => editor.definitions.value.get('PRODUCT'))
  const titleOf = (id: number) => parts.first(id, 'TITLE')?.text || '未命名的发行版本'
  const factsOf = (id: number) => {
    const date = parts.first(id, 'RELEASE_DATE')
    return [
      ...parts
        .values(id, 'PLATFORM')
        .map(item => (item.code ? codeLabel('PLATFORM', item.code) : '')),
      date?.date ? dateText(date.date, date.date_precision) : '',
    ]
      .filter(Boolean)
      .join('，')
  }

  function add() {
    const id = parts.create('PRODUCT', [
      ['INCLUDED_GAME', { target: { id: props.game.id, type: 'GAME', label: props.game.label } }],
      ['TITLE', { text: parts.first(props.game.id, 'TITLE')?.text ?? props.game.label }],
    ])
    void navigateTo(`${base.value}/${id}`)
  }

  function copy(source: number) {
    void navigateTo(`${base.value}/${parts.copy(source, 'PRODUCT')}`)
  }
</script>

<template>
  <Stack gap="lg">
    <Inline gap="sm" align="center" justify="between">
      <Text size="sm" tone="muted">{{ releases.length }} 个发行版本</Text>
      <Inline gap="sm">
        <DropdownMenu v-if="releases.length" label="复制已有的发行版本" align="end">
          <Button variant="outline" tone="neutral" size="sm">
            <template #icon><Copy /></template>
            复制已有的发行版本
          </Button>
          <template #content>
            <DropdownMenuItem v-for="item in releases" :key="item.id" @select="copy(item.id)">
              {{ titleOf(item.id) }}
            </DropdownMenuItem>
          </template>
        </DropdownMenu>
        <Button size="sm" @click="add">
          <template #icon><Plus /></template>
          新建发行版本
        </Button>
      </Inline>
    </Inline>
    <Empty v-if="!releases.length" title="还没有发行版本" />
    <SimpleGrid v-else min="16rem" gap="sm">
      <WikiEditorEntryCard
        v-for="item in releases"
        :key="item.id"
        :to="`${base}/${item.id}`"
        :active="item.id === selected"
        :created="item.id < 0"
        :title="titleOf(item.id)"
        :facts="factsOf(item.id)"
        :cover="parts.first(item.id, 'COVER')?.media ?? null"
      />
    </SimpleGrid>
    <Stack v-if="current && definition" gap="lg">
      <Inline gap="md" align="baseline" justify="between">
        <Heading :level="2" size="sm" lang="ja">{{ titleOf(current.id) }}</Heading>
        <Link
          v-if="current.id > 0"
          :as="NuxtLink"
          :to="`/entries/${current.id}/history`"
          class="text-sm"
        >
          这个版本的修改记录
        </Link>
      </Inline>
      <WikiEditorForm :entry="current" :definition="definition" />
    </Stack>
  </Stack>
</template>
