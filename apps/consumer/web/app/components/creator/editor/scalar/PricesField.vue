<script setup lang="ts">
  import {
    Button,
    Card,
    IconButton,
    Inline,
    Input,
    NumberInput,
    Select,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import type { BackendEditorField, BackendGalgamePriceRow } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    disabled?: boolean
  }>()
  const model = defineModel<BackendGalgamePriceRow[]>({ default: () => [] })

  const CURRENCY_OPTIONS = ['JPY', 'USD', 'CNY', 'EUR', 'KRW', 'TWD', 'HKD', 'GBP'].map(code => ({
    value: code,
    label: code,
  }))
  const TAX_OPTIONS = [
    { label: '含税', value: 'included' },
    { label: '不含税', value: 'excluded' },
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

  function taxValue(row: BackendGalgamePriceRow): string | null {
    if (row.tax_included === true) return 'included'
    if (row.tax_included === false) return 'excluded'
    return null
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
  <Stack gap="sm" align="stretch">
    <Card v-for="(row, index) in model" :key="index" :padded="false">
      <Inline gap="sm" align="center" :wrap="false" class="p-2">
        <Input
          :model-value="row.version ?? ''"
          placeholder="版本"
          size="sm"
          :disabled="disabled"
          :invalid="isDuplicate(row)"
          class="min-w-0 flex-2"
          @update:model-value="value => setRow(index, 'version', value || null)"
        />
        <NumberInput
          :model-value="row.amount ?? null"
          placeholder="金额"
          size="sm"
          :min="0"
          :format-options="{ maximumFractionDigits: 2, useGrouping: false }"
          :disabled="disabled"
          class="min-w-0 flex-1"
          @update:model-value="
            value => setRow(index, 'amount', typeof value === 'number' ? value : null)
          "
        />
        <Select
          :model-value="row.currency ?? null"
          :options="CURRENCY_OPTIONS"
          placeholder="币种"
          size="sm"
          clearable
          :disabled="disabled"
          class="min-w-0 flex-1"
          @update:model-value="
            value => setRow(index, 'currency', typeof value === 'string' ? value : null)
          "
        />
        <Select
          :model-value="taxValue(row)"
          :options="TAX_OPTIONS"
          placeholder="税"
          size="sm"
          clearable
          :disabled="disabled"
          class="min-w-0 flex-1"
          @update:model-value="
            value => setRow(index, 'tax_included', value == null ? null : value === 'included')
          "
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

    <Button
      variant="outline"
      tone="neutral"
      size="sm"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="addRow"
    >
      <template #icon><Plus /></template>
      添加价格
    </Button>

    <Text size="xs" tone="muted">{{ model.length }} / {{ maxRows }}</Text>
  </Stack>
</template>
