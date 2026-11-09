<script setup lang="ts">
  import {
    Button,
    Empty,
    FormLayout,
    Panel,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
  } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { useEntryCards } from '~/features/wiki/composables/useEntryCards'
  import { useWorkRelations } from '~/features/wiki/composables/useWorkRelations'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import { codeLabel } from '~/features/wiki/values'

  defineOptions({ name: 'WikiWorkRelations' })

  const props = defineProps<{ work: EditableEntry; base: string }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const definition = computed(() => editor.definitions.value.get(props.work.type))
  const field = (property: string) =>
    definition.value?.properties.find(item => item.property === property)
  const relation = computed(() => (props.work.type === 'GAME' ? field('GAME_RELATION') : undefined))
  const options = computed(() =>
    (relation.value?.codes ?? []).map(value => ({
      value,
      label: codeLabel('GAME_RELATION', value),
    })),
  )
  const relations = useWorkRelations(() => props.work)
  const cards = useEntryCards(() => relations.rows.value.map(row => row.other.id), ['GAME'])
  const rows = computed(() =>
    [...relations.rows.value].sort(
      (a, b) =>
        (cards.value.get(a.other.id)?.year ?? 9999) - (cards.value.get(b.other.id)?.year ?? 9999) ||
        a.other.id - b.other.id,
    ),
  )
  const live = computed(() => rows.value.filter(row => row.state !== 'removed').length)
</script>

<template>
  <Panel v-if="relation" title="相关作品" :count="live">
    <template #actions>
      <WikiFieldRule v-if="relation.clauses.length" label="相关作品" :clauses="relation.clauses" />
      <Button
        :as="NuxtLink"
        :to="{ path: base, query: { ...route.query, panel: 'relation' } }"
        size="sm"
        variant="ghost"
      >
        <template #icon><Plus /></template>
        添加相关作品
      </Button>
    </template>
    <Empty v-if="!rows.length" title="暂无相关作品" />
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>作品</TableHead>
          <TableHead class="max-sm:hidden">关系</TableHead>
          <TableHead class="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <WikiWorkRelationRow
          v-for="row in rows"
          :key="row.key"
          :row="row"
          :card="cards.get(row.other.id)"
          :options="options"
          @kind="code => relations.kind(row, code)"
          @flip="relations.flip(row)"
          @remove="relations.remove(row)"
          @undo="relations.undo(row)"
        />
      </TableBody>
    </Table>
  </Panel>
  <Panel v-else-if="field('SERIES_RELATION')" title="相关作品">
    <FormLayout orientation="responsive" label-width="8rem">
      <WikiFieldProperty
        :entry="work.id"
        :definition="field('SERIES_RELATION')!"
        label="相关系列"
      />
    </FormLayout>
  </Panel>
  <Panel v-if="field('ADAPTATION')" title="改编">
    <Stack gap="md">
      <FormLayout orientation="responsive" label-width="8rem">
        <WikiFieldProperty :entry="work.id" :definition="field('ADAPTATION')!" label="改编作品" />
      </FormLayout>
    </Stack>
  </Panel>
</template>
