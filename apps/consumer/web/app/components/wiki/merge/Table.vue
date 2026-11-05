<script setup lang="ts">
  import {
    Button,
    Inline,
    Input,
    Page,
    PageBody,
    Panel,
    RadioGroup,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { EditOperation, EntryStatement } from '~/features/wiki/editor/draft'
  import { qualifierText, valueText } from '~/features/wiki/values'
  import type { MergePageData } from '~~/server/api/pages/entries/[id]/merge/[other].get'

  defineOptions({ name: 'WikiMergeTable' })

  const props = defineProps<{ data: MergePageData }>()
  const { typeName } = useWikiDefinitions()
  const choices = ref<Record<string, 'kept' | 'merged'>>({})
  const bus = useWikiSavedBus()
  const note = ref('')
  const submitting = ref(false)
  watch(
    () => props.data.merged.id,
    () => {
      choices.value = {}
      note.value = ''
    },
  )

  const describe = (statement: EntryStatement) => {
    const qualifier = qualifierText(statement)
    const text = valueText(statement) || '空'
    return qualifier ? `${text}（${qualifier}）` : text
  }
  const rows = computed(() =>
    (props.data.definition?.properties ?? []).flatMap(definition => {
      const of = (entry: MergePageData['kept']) =>
        entry.statements.filter(item => item.property === definition.property)
      const kept = of(props.data.kept)
      const merged = of(props.data.merged)
      if (!kept.length && !merged.length) return []
      return [
        {
          property: definition.property,
          label: definition.label,
          kept,
          merged,
          conflict: props.data.preview.conflicts.includes(definition.property),
        },
      ]
    }),
  )
  const options = (row: (typeof rows.value)[number]) => [
    { value: 'kept', label: row.kept.map(describe).join('、') },
    { value: 'merged', label: row.merged.map(describe).join('、') },
  ]

  function choose(property: string, value: unknown) {
    choices.value = { ...choices.value, [property]: value === 'merged' ? 'merged' : 'kept' }
  }

  async function merge() {
    submitting.value = true
    try {
      const dropped: EditOperation[] = rows.value
        .filter(row => row.conflict)
        .flatMap(row =>
          (choices.value[row.property] ?? 'kept') === 'kept' ? row.merged : row.kept,
        )
        .map(statement => ({ op: 'deprecate', statement: statement.id, reason: 'CONTRADICTED' }))
      const text = note.value.trim()
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations: [...dropped, ...props.data.preview.operations],
          base: [props.data.kept, props.data.merged].map(entry => ({
            entry_id: entry.id,
            revision: entry.revision,
          })),
          ...(text ? { note: text } : {}),
        },
      })
      bus.emit(result.entries)
      await navigateTo({
        path: `/entries/${props.data.kept.id}/edit`,
        query: { saved: String(result.edit_id) },
      })
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Page size="lg" class="max-md:py-4">
    <WikiPageHead
      :eyebrow="`${typeName(data.kept.type)}：${data.kept.label || '未命名'}`"
      :title="`将「${data.merged.label || '未命名'}」并入本条目`"
      lang="ja"
    >
      <template #actions>
        <Button
          :as="NuxtLink"
          :to="`/entries/${data.kept.id}/edit`"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><ArrowLeft /></template>
          返回编辑
        </Button>
      </template>
    </WikiPageHead>
    <PageBody>
      <Panel title="对照两个条目" :padded="false">
        <Table class="hikari-panel-table">
          <TableHeader>
            <TableRow>
              <TableHead>项目</TableHead>
              <TableHead>本条目</TableHead>
              <TableHead>另一个条目</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="row in rows"
              :key="row.property"
              :class="row.conflict ? 'bg-warning-soft' : undefined"
            >
              <TableCell class="py-3 align-top">
                <Text size="sm" tone="muted">{{ row.label }}</Text>
              </TableCell>
              <TableCell v-if="row.conflict" colspan="2" class="py-3 align-top">
                <RadioGroup
                  :model-value="choices[row.property] ?? 'kept'"
                  :options="options(row)"
                  orientation="horizontal"
                  lang="ja"
                  @update:model-value="value => choose(row.property, value)"
                />
              </TableCell>
              <template v-else>
                <TableCell
                  v-for="(side, index) in [row.kept, row.merged]"
                  :key="index"
                  class="py-3 align-top"
                >
                  <Stack gap="xs">
                    <Text
                      v-for="item in side"
                      :key="item.id"
                      size="sm"
                      lang="ja"
                      class="whitespace-pre-line"
                    >
                      {{ describe(item) }}
                    </Text>
                  </Stack>
                </TableCell>
              </template>
            </TableRow>
          </TableBody>
        </Table>
      </Panel>
      <Inline gap="sm" align="center" :wrap="false">
        <Input v-model="note" placeholder="编辑说明" class="min-w-0 flex-1" />
        <Button :loading="submitting" @click="merge">合并</Button>
      </Inline>
    </PageBody>
  </Page>
</template>
