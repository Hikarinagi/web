<script setup lang="ts">
  import { GripVertical, Plus, X } from '@lucide/vue'
  import Sortable from 'sortablejs'
  import type { BackendEditorField } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    inputId?: string
    disabled?: boolean
  }>()
  const model = defineModel<Record<string, unknown>[]>({ default: () => [] })

  provide('$pcFormField', undefined)
  provide('$pcForm', undefined)

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

  const list = ref<HTMLElement | null>(null)
  let sortable: Sortable | null = null
  onMounted(() => {
    if (!list.value) return
    sortable = Sortable.create(list.value, {
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
  <div class="flex flex-col gap-2">
    <div ref="list" class="flex flex-col gap-2">
      <div
        v-for="(row, index) in rows"
        :key="rowKeys[index]"
        data-label-row
        class="flex items-center gap-2 rounded-lg border p-2"
        :class="
          isDuplicate(row.key)
            ? 'border-red-300 dark:border-red-700'
            : 'border-(--p-form-field-border-color)'
        "
      >
        <Button
          unstyled
          class="label-drag-handle flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-color hover:bg-surface-100 active:cursor-grabbing dark:hover:bg-surface-800"
          :aria-label="`拖动第 ${index + 1} 行`"
          :disabled="disabled"
        >
          <GripVertical :size="14" />
        </Button>
        <div class="min-w-0 flex-2">
          <InputText
            :id="index === 0 ? inputId : undefined"
            :model-value="row.key"
            placeholder="字段名"
            size="small"
            :disabled="disabled"
            :invalid="isDuplicate(row.key)"
            fluid
            @update:model-value="
              value => setRow(index, 'key', typeof value === 'string' ? value : '')
            "
          />
        </div>
        <div class="min-w-0 flex-3">
          <InputText
            :model-value="row.value"
            placeholder="内容"
            size="small"
            :disabled="disabled"
            fluid
            @update:model-value="
              value => setRow(index, 'value', typeof value === 'string' ? value : '')
            "
          />
        </div>
        <Button
          type="button"
          unstyled
          class="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-color transition-colors hover:bg-surface-100 hover:text-red-500 dark:hover:bg-surface-800"
          :aria-label="`移除第 ${index + 1} 行`"
          :disabled="disabled"
          @click="removeRow(index)"
        >
          <template #icon><X :size="14" /></template>
        </Button>
      </div>
    </div>

    <Button
      type="button"
      severity="secondary"
      variant="outlined"
      label="添加"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="addRow"
    >
      <template #icon><Plus :size="14" /></template>
    </Button>

    <span class="text-xs text-muted-color">{{ model.length }} / {{ maxRows }}</span>
  </div>
</template>
