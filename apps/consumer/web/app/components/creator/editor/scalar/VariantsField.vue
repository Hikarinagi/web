<script setup lang="ts">
  import {
    Button,
    Card,
    DatePicker,
    IconButton,
    Inline,
    Input,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import { BOOK_VARIANT_KIND_CN } from '@hikarinagi/shared'
  import type { BackendBookVariantRow, BackendEditorField } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    disabled?: boolean
  }>()
  type Row = Partial<BackendBookVariantRow>
  const model = defineModel<Row[]>({ default: () => [] })

  const KIND_OPTIONS = Object.entries(BOOK_VARIANT_KIND_CN).map(([value, label]) => ({
    value,
    label,
  }))
  const CURRENCY_OPTIONS = ['JPY', 'CNY', 'USD', 'TWD', 'HKD', 'KRW'].map(code => ({
    value: code,
    label: code,
  }))

  const maxRows = computed(() => props.field.max_length ?? 20)
  const canAdd = computed(() => model.value.length < maxRows.value)

  function set<K extends keyof Row>(index: number, key: K, value: Row[K]) {
    const next = model.value.slice()
    next[index] = { ...next[index], [key]: value }
    model.value = next
  }
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)
</script>

<template>
  <Stack gap="sm" align="stretch">
    <Card v-for="(row, index) in model" :key="index" :padded="false">
      <Stack gap="sm" class="p-3">
        <Inline gap="sm" align="center" :wrap="false">
          <Input
            :model-value="row.title"
            placeholder="名称"
            size="sm"
            :invalid="!row.title?.trim()"
            :disabled="disabled"
            class="min-w-0 flex-1"
            @update:model-value="value => set(index, 'title', value)"
          />
          <IconButton
            :label="`移除第 ${index + 1} 行`"
            variant="ghost"
            tone="danger"
            size="sm"
            pill
            :disabled="disabled"
            class="shrink-0"
            @click="model = model.filter((_, i) => i !== index)"
          >
            <X />
          </IconButton>
        </Inline>
        <SimpleGrid min="9rem" gap="sm">
          <Stack gap="xs">
            <Text size="xs" tone="muted">类型</Text>
            <Select
              :model-value="row.kind ?? 'SPECIAL'"
              :options="KIND_OPTIONS"
              size="sm"
              :disabled="disabled"
              @update:model-value="value => set(index, 'kind', value as Row['kind'])"
            />
          </Stack>
          <Stack gap="xs">
            <Text size="xs" tone="muted">ISBN</Text>
            <Input
              :model-value="row.isbn ?? ''"
              size="sm"
              :disabled="disabled"
              @update:model-value="value => set(index, 'isbn', text(value))"
            />
          </Stack>
          <Stack gap="xs">
            <Text size="xs" tone="muted">价格</Text>
            <NumberInput
              :model-value="row.price_amount ?? null"
              size="sm"
              :min="0"
              :format-options="{ maximumFractionDigits: 2, useGrouping: false }"
              :disabled="disabled"
              @update:model-value="
                value => set(index, 'price_amount', typeof value === 'number' ? value : null)
              "
            />
          </Stack>
          <Stack gap="xs">
            <Text size="xs" tone="muted">货币</Text>
            <Select
              :model-value="row.price_currency ?? null"
              :options="CURRENCY_OPTIONS"
              size="sm"
              clearable
              :disabled="disabled"
              @update:model-value="
                value => set(index, 'price_currency', typeof value === 'string' ? value : null)
              "
            />
          </Stack>
          <Stack gap="xs">
            <Text size="xs" tone="muted">发售日</Text>
            <DatePicker
              :model-value="row.publication_date ?? null"
              size="sm"
              clearable
              :disabled="disabled"
              @update:model-value="value => set(index, 'publication_date', value || null)"
            />
          </Stack>
        </SimpleGrid>
      </Stack>
    </Card>
    <Button
      variant="outline"
      tone="neutral"
      size="sm"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="model = [...model, { kind: 'SPECIAL', title: '' }]"
    >
      <template #icon><Plus /></template>
      添加特装版
    </Button>
    <Text size="xs" tone="muted">{{ model.length }} / {{ maxRows }}</Text>
  </Stack>
</template>
