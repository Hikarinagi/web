<script setup lang="ts">
  import { Button, Inline, Panel, SegmentedControl, Stack, Text, toast } from '@hina-ui/vue'
  import type { EditOperation, EntryStatement } from '~/features/wiki/editor/draft'
  import { qualifierText, valueText } from '~/features/wiki/values'
  import type { MergePageData } from '~~/server/api/pages/entries/[id]/merge/[other].get'

  defineOptions({ name: 'WikiMergeTable' })

  const props = defineProps<{ data: MergePageData }>()
  const choices = ref<Record<string, 'kept' | 'merged'>>({})
  const submitting = ref(false)
  const OPTIONS = [
    { value: 'kept', label: '留下本条目的' },
    { value: 'merged', label: '留下并入的' },
  ]

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
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations: [...dropped, ...props.data.preview.operations],
          base: [props.data.kept, props.data.merged].map(entry => ({
            entry_id: entry.id,
            revision: entry.revision,
          })),
        },
      })
      toast.success('已合并', {
        action: {
          label: '查看本次修改',
          onClick: () => void navigateTo(`/create/wiki/changes/${result.edit_id}`),
        },
      })
      await navigateTo(`/entries/${props.data.kept.id}/edit`)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Panel :title="`把「${data.merged.label}」并入「${data.kept.label}」`" :padded="false">
    <template #actions>
      <Button size="sm" :loading="submitting" @click="merge">合并</Button>
    </template>
    <Stack gap="none" align="stretch" class="divide-y divide-line">
      <Inline gap="md" align="center" :wrap="false" class="bg-subtle px-(--hn-panel-p) py-2">
        <Text size="xs" tone="muted" class="w-28 shrink-0">属性</Text>
        <Text size="xs" tone="muted" lang="ja" class="min-w-0 flex-1" truncate>
          本条目：{{ data.kept.label }}
        </Text>
        <Text size="xs" tone="muted" lang="ja" class="min-w-0 flex-1" truncate>
          并入的条目：{{ data.merged.label }}
        </Text>
      </Inline>
      <Stack v-for="row in rows" :key="row.property" gap="sm" class="px-(--hn-panel-p) py-3">
        <Inline gap="md" align="start" :wrap="false">
          <Text size="sm" tone="muted" class="w-28 shrink-0">{{ row.label }}</Text>
          <Stack gap="xs" class="min-w-0 flex-1">
            <Text v-for="item in row.kept" :key="item.id" size="sm" lang="ja">{{
              describe(item)
            }}</Text>
          </Stack>
          <Stack gap="xs" class="min-w-0 flex-1">
            <Text v-for="item in row.merged" :key="item.id" size="sm" lang="ja">{{
              describe(item)
            }}</Text>
          </Stack>
        </Inline>
        <SegmentedControl
          v-if="row.conflict"
          :model-value="choices[row.property] ?? 'kept'"
          :options="OPTIONS"
          size="sm"
          class="self-end"
          @update:model-value="value => choose(row.property, value)"
        />
      </Stack>
    </Stack>
  </Panel>
</template>
