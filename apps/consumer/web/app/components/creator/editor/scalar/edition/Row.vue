<script setup lang="ts">
  import {
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
  import { X } from '@lucide/vue'
  import { AGE_RATING_CN, GALGAME_EDITION_KIND_CN, RELEASE_STATUS_CN } from '@hikarinagi/shared'
  import type { BackendGalgameEditionRow } from '~/features/creator/editor'
  import { PLATFORM_OPTIONS } from '~/features/galgame/platforms'

  defineProps<{
    index: number
    duplicate: boolean
    disabled?: boolean
  }>()
  const emit = defineEmits<{ remove: [] }>()
  const row = defineModel<BackendGalgameEditionRow>({ required: true })

  const options = (labels: Record<string, string>) =>
    Object.entries(labels).map(([value, label]) => ({ value, label }))
  const KIND_OPTIONS = options(GALGAME_EDITION_KIND_CN)
  const STATUS_OPTIONS = options(RELEASE_STATUS_CN)
  const AGE_OPTIONS = options(AGE_RATING_CN)
  const CURRENCY_OPTIONS = ['JPY', 'USD', 'CNY', 'EUR', 'KRW', 'TWD', 'HKD', 'GBP'].map(code => ({
    value: code,
    label: code,
  }))
  const TAX_OPTIONS = [
    { label: '含税', value: 'included' },
    { label: '不含税', value: 'excluded' },
  ]

  const tax = computed(() =>
    row.value.tax_included === true
      ? 'included'
      : row.value.tax_included === false
        ? 'excluded'
        : null,
  )

  function set<K extends keyof BackendGalgameEditionRow>(
    key: K,
    value: BackendGalgameEditionRow[K],
  ) {
    row.value = { ...row.value, [key]: value }
  }
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)
</script>

<template>
  <Card :padded="false">
    <Stack gap="sm" class="p-3">
      <Inline gap="sm" align="center" :wrap="false">
        <Input
          :model-value="row.title ?? ''"
          placeholder="版本名称"
          size="sm"
          :disabled="disabled"
          :invalid="duplicate"
          class="min-w-0 flex-1"
          @update:model-value="value => set('title', value)"
        />
        <IconButton
          :label="`移除第 ${index + 1} 行`"
          variant="ghost"
          tone="danger"
          size="sm"
          pill
          :disabled="disabled"
          class="shrink-0"
          @click="emit('remove')"
        >
          <X />
        </IconButton>
      </Inline>
      <SimpleGrid min="9rem" gap="sm">
        <Stack gap="xs">
          <Text size="xs" tone="muted">类型</Text>
          <Select
            :model-value="row.kind ?? null"
            :options="KIND_OPTIONS"
            size="sm"
            clearable
            :disabled="disabled"
            @update:model-value="
              value => set('kind', (value ?? null) as BackendGalgameEditionRow['kind'])
            "
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">JAN</Text>
          <Input
            :model-value="row.jan ?? ''"
            size="sm"
            inputmode="numeric"
            :disabled="disabled"
            @update:model-value="value => set('jan', text(value))"
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">品番</Text>
          <Input
            :model-value="row.product_code ?? ''"
            size="sm"
            :disabled="disabled"
            @update:model-value="value => set('product_code', text(value))"
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">平台</Text>
          <Select
            :model-value="row.platform ?? null"
            :options="PLATFORM_OPTIONS"
            size="sm"
            clearable
            :disabled="disabled"
            @update:model-value="value => set('platform', typeof value === 'string' ? value : null)"
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">价格</Text>
          <NumberInput
            :model-value="row.price ?? null"
            size="sm"
            :min="0"
            :format-options="{ maximumFractionDigits: 2, useGrouping: false }"
            :disabled="disabled"
            @update:model-value="value => set('price', typeof value === 'number' ? value : null)"
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">货币</Text>
          <Select
            :model-value="row.currency ?? null"
            :options="CURRENCY_OPTIONS"
            size="sm"
            clearable
            :disabled="disabled"
            @update:model-value="value => set('currency', typeof value === 'string' ? value : null)"
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">含税</Text>
          <Select
            :model-value="tax"
            :options="TAX_OPTIONS"
            size="sm"
            clearable
            :disabled="disabled"
            @update:model-value="
              value => set('tax_included', value == null ? null : value === 'included')
            "
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">发售日</Text>
          <DatePicker
            :model-value="row.release_date ?? null"
            size="sm"
            clearable
            :disabled="disabled"
            @update:model-value="value => set('release_date', value || null)"
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">发售状态</Text>
          <Select
            :model-value="row.release_status ?? null"
            :options="STATUS_OPTIONS"
            size="sm"
            clearable
            :disabled="disabled"
            @update:model-value="
              value =>
                set('release_status', (value ?? null) as BackendGalgameEditionRow['release_status'])
            "
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" tone="muted">年龄分级</Text>
          <Select
            :model-value="row.age_rating ?? null"
            :options="AGE_OPTIONS"
            size="sm"
            clearable
            :disabled="disabled"
            @update:model-value="
              value => set('age_rating', (value ?? null) as BackendGalgameEditionRow['age_rating'])
            "
          />
        </Stack>
      </SimpleGrid>
    </Stack>
  </Card>
</template>
