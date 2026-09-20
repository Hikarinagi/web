<script setup lang="ts">
  import { Plus, X } from '@lucide/vue'
  import type { BackendEditorField, BackendGalgamePriceRow } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    inputId?: string
    disabled?: boolean
  }>()
  const model = defineModel<BackendGalgamePriceRow[]>({ default: () => [] })

  // 多输入控件必须切断 FormField 的 inject,否则每个 PrimeVue 编辑器都会被
  // 自动注册到外层 FormField,modelValue 被劫持成 $field.value(整个 prices 数组)。
  provide('$pcFormField', undefined)
  provide('$pcForm', undefined)

  const CURRENCY_OPTIONS = ['JPY', 'USD', 'CNY', 'EUR', 'KRW', 'TWD', 'HKD', 'GBP']
  const TAX_OPTIONS = [
    { label: '含税', value: true },
    { label: '不含税', value: false },
  ]

  const maxRows = computed(() => props.field.max_length ?? 30)
  const canAdd = computed(() => model.value.length < maxRows.value)

  const versionCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const row of model.value) {
      const key = typeof row.version === 'string' ? row.version.trim() : ''
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  })
  function isDuplicate(row: BackendGalgamePriceRow): boolean {
    const key = typeof row.version === 'string' ? row.version.trim() : ''
    return key !== '' && (versionCounts.value.get(key) ?? 0) > 1
  }

  function setRow<K extends keyof BackendGalgamePriceRow>(
    index: number,
    key: K,
    value: BackendGalgamePriceRow[K],
  ) {
    const next = model.value.slice()
    next[index] = { ...next[index], [key]: value }
    model.value = next
  }

  function addRow() {
    if (!canAdd.value) return
    model.value = [
      ...model.value,
      { version: null, amount: null, currency: null, tax_included: null },
    ]
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
      <div class="min-w-0 flex-2">
        <InputText
          :id="index === 0 ? inputId : undefined"
          :model-value="row.version ?? ''"
          placeholder="版本"
          size="small"
          :disabled="disabled"
          :invalid="isDuplicate(row)"
          fluid
          @update:model-value="
            value =>
              setRow(index, 'version', typeof value === 'string' && value !== '' ? value : null)
          "
        />
      </div>
      <div class="min-w-0 flex-1">
        <InputNumber
          :model-value="row.amount ?? null"
          placeholder="金额"
          size="small"
          :min="0"
          :max-fraction-digits="2"
          :use-grouping="false"
          :disabled="disabled"
          fluid
          @input="
            event => setRow(index, 'amount', typeof event.value === 'number' ? event.value : null)
          "
          @update:model-value="
            value => setRow(index, 'amount', typeof value === 'number' ? value : null)
          "
        />
      </div>
      <div class="min-w-0 flex-1">
        <Select
          :model-value="row.currency ?? null"
          :options="CURRENCY_OPTIONS"
          placeholder="币种"
          size="small"
          :disabled="disabled"
          fluid
          @update:model-value="
            value => setRow(index, 'currency', typeof value === 'string' ? value : null)
          "
        />
      </div>
      <div class="min-w-0 flex-1">
        <Select
          :model-value="row.tax_included ?? null"
          :options="TAX_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="税"
          size="small"
          show-clear
          :disabled="disabled"
          fluid
          @update:model-value="
            value => setRow(index, 'tax_included', typeof value === 'boolean' ? value : null)
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
      label="添加价格"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="addRow"
    >
      <template #icon><Plus :size="14" /></template>
    </Button>

    <span class="text-xs text-muted-color">{{ model.length }} / {{ maxRows }}</span>
  </div>
</template>
