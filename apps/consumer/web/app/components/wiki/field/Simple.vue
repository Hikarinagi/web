<script setup lang="ts">
  import { Inline, Input, NumberInput, Select, Textarea } from '@hina-ui/vue'
  import { CURRENCY_NAMES, LANGUAGE_LABELS } from '~/features/galgame/labels'
  import type { PropertyDefinition, ValueDraft } from '~/features/wiki/editor/draft'
  import { dateInput, parseDate } from '~/features/wiki/editor/inputs'
  import { codeLabel, LONG_PROPERTIES } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldSimple' })

  const props = defineProps<{ definition: PropertyDefinition; label: string }>()
  const model = defineModel<ValueDraft>({ required: true })

  const patch = (fields: Partial<ValueDraft>) => (model.value = { ...model.value, ...fields })
  const text = computed({
    get: () => model.value.text ?? '',
    set: value => patch({ text: value }),
  })
  const date = computed({
    get: () => dateInput(model.value.date, model.value.date_precision),
    set: value => {
      const parsed = parseDate(value)
      patch({ date: parsed.date, date_precision: parsed.precision })
    },
  })
  const code = computed({
    get: () => model.value.code,
    set: value => patch({ code: value === undefined || value === null ? null : String(value) }),
  })
  const long = computed(() => LONG_PROPERTIES.includes(props.definition.property))
  const codes = computed(() =>
    props.definition.shape === 'language'
      ? Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label }))
      : (props.definition.codes ?? []).map(value => ({
          value,
          label: codeLabel(props.definition.property, value),
        })),
  )
  const currencies = Object.entries(CURRENCY_NAMES).map(([value, label]) => ({ value, label }))
  const taxes = [
    { value: 'yes', label: '含税' },
    { value: 'no', label: '不含税' },
  ]
  const lang = computed(() => (props.definition.shape === 'verbatim' ? 'ja' : undefined))
</script>

<template>
  <Select
    v-if="definition.shape === 'code' || definition.shape === 'language'"
    v-model="code"
    :options="codes"
    :aria-label="label"
    :clearable="definition.optional_code"
    placeholder="选择"
  />
  <Input
    v-else-if="definition.shape === 'date'"
    v-model="date"
    :aria-label="label"
    placeholder="2026-10-04、2026-10 或 2026"
  />
  <NumberInput
    v-else-if="definition.shape === 'integer'"
    :model-value="model.number"
    :aria-label="label"
    @update:model-value="value => patch({ number: Number.isFinite(value) ? value : null })"
  />
  <Inline v-else-if="definition.shape === 'money'" gap="sm" align="center" :wrap="false">
    <NumberInput
      :model-value="model.amount ? Number(model.amount) : null"
      :min="0"
      :aria-label="label"
      class="w-40 min-w-0"
      @update:model-value="
        value => patch({ amount: value === null || value === undefined ? null : String(value) })
      "
    />
    <Select
      :model-value="model.currency"
      :options="currencies"
      aria-label="币种"
      placeholder="币种"
      class="w-28 shrink-0"
      @update:model-value="value => patch({ currency: value ? String(value) : null })"
    />
    <Select
      :model-value="model.tax_included === false ? 'no' : model.tax_included ? 'yes' : null"
      :options="taxes"
      aria-label="是否含税"
      placeholder="是否含税"
      class="w-28 shrink-0"
      @update:model-value="value => patch({ tax_included: value ? value === 'yes' : null })"
    />
  </Inline>
  <Textarea v-else-if="long" v-model="text" :aria-label="label" :lang="lang" :min-rows="3" />
  <Input v-else v-model="text" :aria-label="label" :lang="lang" />
</template>
