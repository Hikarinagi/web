<script setup lang="ts">
  import { Plus, X } from '@lucide/vue'
  import type { BackendEditorField } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    inputId?: string
    disabled?: boolean
  }>()
  const model = defineModel<Record<string, unknown>[]>({ default: () => [] })

  provide('$pcFormField', undefined)
  provide('$pcForm', undefined)

  const maxRows = computed(() => props.field.max_length ?? 10)
  const canAdd = computed(() => model.value.length < maxRows.value)

  function appId(row: Record<string, unknown>): number | null {
    return typeof row.app_id === 'number' ? row.app_id : null
  }

  const idCounts = computed(() => {
    const counts = new Map<number, number>()
    for (const row of model.value) {
      const id = appId(row)
      if (id !== null) counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    return counts
  })
  function isDuplicate(row: Record<string, unknown>): boolean {
    const id = appId(row)
    return id !== null && (idCounts.value.get(id) ?? 0) > 1
  }

  function setRow(index: number, value: number | null) {
    const next = model.value.slice()
    const current = next[index]
    if (!current) return
    next[index] = { ...current, app_id: value }
    model.value = next
  }

  function addRow() {
    if (!canAdd.value) return
    model.value = [...model.value, { app_id: null }]
  }

  function removeRow(index: number) {
    model.value = model.value.filter((_, i) => i !== index)
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(row, index) in model"
      :key="index"
      class="flex items-center gap-2 rounded-lg border p-2"
      :class="
        isDuplicate(row)
          ? 'border-red-300 dark:border-red-700'
          : 'border-(--p-form-field-border-color)'
      "
    >
      <div class="min-w-0 flex-1">
        <InputNumber
          :input-id="index === 0 ? inputId : undefined"
          :model-value="appId(row)"
          placeholder="1144400"
          size="small"
          :use-grouping="false"
          :min="1"
          :invalid="isDuplicate(row)"
          :disabled="disabled"
          fluid
          @update:model-value="value => setRow(index, typeof value === 'number' ? value : null)"
        />
      </div>
      <a
        v-if="appId(row)"
        :href="`https://store.steampowered.com/app/${appId(row)}/`"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 text-xs text-muted-color underline-offset-2 hover:underline"
      >
        打开商店页
      </a>
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

    <Button
      type="button"
      severity="secondary"
      variant="outlined"
      label="添加 Steam App"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="addRow"
    >
      <template #icon><Plus :size="14" /></template>
    </Button>

    <span class="text-xs text-muted-color">{{ model.length }} / {{ maxRows }}</span>
  </div>
</template>
