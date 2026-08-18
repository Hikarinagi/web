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

  const maxRows = computed(() => props.field.max_length ?? 50)
  const canAdd = computed(() => model.value.length < maxRows.value)

  function text(row: Record<string, unknown>, key: 'name' | 'label' | 'url'): string {
    const value = row[key]
    return typeof value === 'string' ? value : ''
  }

  const urlCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const row of model.value) {
      const key = text(row, 'url').trim()
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  })
  function isDuplicate(row: Record<string, unknown>): boolean {
    const key = text(row, 'url').trim()
    return key !== '' && (urlCounts.value.get(key) ?? 0) > 1
  }

  function setRow(index: number, key: 'name' | 'label' | 'url', value: string) {
    const next = model.value.slice()
    const current = next[index]
    if (!current) return
    next[index] = { ...current, [key]: value }
    model.value = next
  }

  function addRow() {
    if (!canAdd.value) return
    model.value = [...model.value, { name: '', label: '', url: '' }]
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
        <InputText
          :id="index === 0 ? inputId : undefined"
          :model-value="text(row, 'name')"
          placeholder="来源标识,如 steam"
          size="small"
          :disabled="disabled"
          fluid
          @update:model-value="
            value => setRow(index, 'name', typeof value === 'string' ? value : '')
          "
        />
      </div>
      <div class="min-w-0 flex-1">
        <InputText
          :model-value="text(row, 'label')"
          placeholder="显示名称"
          size="small"
          :disabled="disabled"
          fluid
          @update:model-value="
            value => setRow(index, 'label', typeof value === 'string' ? value : '')
          "
        />
      </div>
      <div class="min-w-0 flex-2">
        <InputText
          :model-value="text(row, 'url')"
          placeholder="https://"
          size="small"
          :disabled="disabled"
          :invalid="isDuplicate(row)"
          fluid
          @update:model-value="
            value => setRow(index, 'url', typeof value === 'string' ? value : '')
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

    <Button
      type="button"
      severity="secondary"
      variant="outlined"
      label="添加链接"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="addRow"
    >
      <template #icon><Plus :size="14" /></template>
    </Button>

    <span class="text-xs text-muted-color">{{ model.length }} / {{ maxRows }}</span>
  </div>
</template>
