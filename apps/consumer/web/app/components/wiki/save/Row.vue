<script setup lang="ts">
  import { Button, Inline, Select, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { DeprecationReason, ValueDraft } from '~/features/wiki/editor/draft'
  import type { ReviewRow } from '~/features/wiki/editor/review'
  import {
    DEPRECATION_REASONS,
    LONG_PROPERTIES,
    qualifierText,
    valueText,
  } from '~/features/wiki/values'

  defineOptions({ name: 'WikiSaveRow' })

  const props = defineProps<{ row: ReviewRow }>()
  const editor = inject(ENTRY_EDITOR)!

  const describe = (value: ValueDraft | null) => {
    if (!value) return ''
    const qualifier = qualifierText(value)
    const text = valueText({ ...value, property: props.row.property }) || '空'
    return qualifier ? `${text}（${qualifier}）` : text
  }
  const before = computed(() =>
    props.row.state === 'added' || props.row.state === 'restored'
      ? ''
      : describe(props.row.before ?? props.row.value),
  )
  const after = computed(() =>
    props.row.state === 'removed' || props.row.state === 'moved_out'
      ? ''
      : describe(props.row.value),
  )
  const linked = computed(() => {
    const target = props.row.value.target
    return props.row.shape === 'credit' && target && target.id !== props.row.before?.target?.id
      ? target.label
      : null
  })
  const reasons = Object.entries(DEPRECATION_REASONS)
    .filter(([value]) => value !== 'REVERTED')
    .map(([value, label]) => ({ value, label }))
  function choose(value: string | number | null | undefined) {
    if (value) editor.reason(props.row.id, String(value) as DeprecationReason)
  }
  const NOTES: Partial<Record<ReviewRow['state'], string>> = {
    restored: '恢复',
    moved_out: '移到另一个条目',
    moved_in: '从另一个条目移来',
  }
</script>

<template>
  <Inline
    gap="md"
    align="start"
    :wrap="false"
    class="border-b border-line px-4 py-3 last:border-b-0"
  >
    <Text size="sm" tone="muted" class="w-24 shrink-0">{{ row.label }}</Text>
    <Stack gap="xs" class="min-w-0 flex-1">
      <WikiDiffImages
        v-if="row.shape === 'image'"
        :before="row.state === 'added' ? null : (row.before?.media ?? null)"
        :after="row.state === 'removed' ? null : row.value.media"
      />
      <WikiDiffLines
        v-else-if="LONG_PROPERTIES.includes(row.property) && row.state === 'changed'"
        :before="row.before?.text ?? ''"
        :after="row.value.text ?? ''"
      />
      <WikiDiffText v-else :before="before" :after="after" />
      <Text v-if="linked" size="xs" tone="muted">关联到 {{ linked }}</Text>
      <Text v-if="NOTES[row.state]" size="xs" tone="muted">{{ NOTES[row.state] }}</Text>
      <Select
        v-if="row.state === 'removed'"
        :model-value="row.reason"
        :options="reasons"
        aria-label="删除原因"
        placeholder="删除原因"
        :invalid="!row.reason"
        class="w-48"
        @update:model-value="choose"
      />
    </Stack>
    <Button variant="link" size="sm" class="shrink-0" @click="editor.revert(row.id)">
      {{ row.state === 'removed' ? '恢复' : '撤回' }}
    </Button>
  </Inline>
</template>
