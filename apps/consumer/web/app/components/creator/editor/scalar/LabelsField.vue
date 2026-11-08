<script setup lang="ts">
  import { Button, Card, IconButton, Inline, Input, Stack, Text } from '@hina-ui/vue'
  import { GripVertical, Plus, X } from '@lucide/vue'
  import Sortable from 'sortablejs'
  import type { BackendEditorField } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    disabled?: boolean
  }>()
  const model = defineModel<Record<string, unknown>[]>({ default: () => [] })

  const rows = computed(() =>
    model.value.map(row => ({
      key: typeof row.key === 'string' ? row.key : '',
      value: typeof row.value === 'string' ? row.value : '',
    })),
  )

  const maxRows = computed(() => props.field.max_length ?? 30)
  const canAdd = computed(() => model.value.length < maxRows.value)

  const keyCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const row of rows.value) {
      const key = row.key.trim()
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  })
  function isDuplicate(key: string): boolean {
    const trimmed = key.trim()
    return trimmed !== '' && (keyCounts.value.get(trimmed) ?? 0) > 1
  }

  let seq = 0
  const rowKeys = ref<number[]>(model.value.map(() => seq++))
  let internal = false
  function commit(next: Record<string, unknown>[], nextKeys?: number[]) {
    if (nextKeys) rowKeys.value = nextKeys
    internal = true
    model.value = next
  }
  watch(model, value => {
    if (internal) {
      internal = false
      return
    }
    rowKeys.value = value.map(() => seq++)
  })

  function setRow(index: number, field: 'key' | 'value', value: string) {
    const next = model.value.slice()
    next[index] = { ...next[index], [field]: value }
    commit(next)
  }

  function addRow() {
    if (!canAdd.value) return
    commit([...model.value, { key: '', value: '' }], [...rowKeys.value, seq++])
  }

  function removeRow(index: number) {
    commit(
      model.value.filter((_, i) => i !== index),
      rowKeys.value.filter((_, i) => i !== index),
    )
  }

  const list = useTemplateRef<{ $el: HTMLElement }>('list')
  let sortable: Sortable | null = null
  onMounted(() => {
    const el = list.value?.$el
    if (!(el instanceof HTMLElement)) return
    sortable = Sortable.create(el, {
      handle: '.label-drag-handle',
      draggable: '[data-label-row]',
      animation: 150,
      ghostClass: 'opacity-40',
      onEnd: event => {
        const { oldIndex, newIndex } = event
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
        const nextModel = model.value.slice()
        const nextKeys = rowKeys.value.slice()
        const [movedRow] = nextModel.splice(oldIndex, 1)
        const [movedKey] = nextKeys.splice(oldIndex, 1)
        if (movedRow === undefined || movedKey === undefined) return
        nextModel.splice(newIndex, 0, movedRow)
        nextKeys.splice(newIndex, 0, movedKey)
        commit(nextModel, nextKeys)
      },
    })
  })
  onBeforeUnmount(() => {
    sortable?.destroy()
    sortable = null
  })
</script>

<template>
  <Stack gap="sm" align="stretch">
    <Stack ref="list" gap="sm" align="stretch">
      <Card v-for="(row, index) in rows" :key="rowKeys[index]" data-label-row :padded="false">
        <Inline gap="sm" align="center" :wrap="false" class="p-2">
          <IconButton
            :label="`拖动第 ${index + 1} 行`"
            variant="ghost"
            tone="neutral"
            size="sm"
            :disabled="disabled"
            class="label-drag-handle shrink-0 cursor-grab active:cursor-grabbing"
          >
            <GripVertical />
          </IconButton>
          <Input
            :model-value="row.key"
            placeholder="字段名"
            size="sm"
            :disabled="disabled"
            :invalid="isDuplicate(row.key)"
            class="min-w-0 flex-2"
            @update:model-value="value => setRow(index, 'key', value ?? '')"
          />
          <Input
            :model-value="row.value"
            placeholder="内容"
            size="sm"
            :disabled="disabled"
            class="min-w-0 flex-3"
            @update:model-value="value => setRow(index, 'value', value ?? '')"
          />
          <IconButton
            :label="`移除第 ${index + 1} 行`"
            variant="ghost"
            tone="danger"
            size="sm"
            pill
            :disabled="disabled"
            class="shrink-0"
            @click="removeRow(index)"
          >
            <X />
          </IconButton>
        </Inline>
      </Card>
    </Stack>

    <Button
      variant="outline"
      tone="neutral"
      size="sm"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="addRow"
    >
      <template #icon><Plus /></template>
      添加
    </Button>

    <Text size="xs" tone="muted">{{ model.length }} / {{ maxRows }}</Text>
  </Stack>
</template>
