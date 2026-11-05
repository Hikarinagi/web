<script setup lang="ts">
  import { Inline, Input, NumberInput, Select, Switch, Textarea } from '@hina-ui/vue'
  import { CURRENCY_SYMBOL, LANGUAGE_LABELS } from '~/features/galgame/labels'
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
  const currencies = Object.keys(CURRENCY_SYMBOL).map(value => ({ value, label: value }))
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
    <Input
      :model-value="model.amount ?? ''"
      inputmode="decimal"
      :aria-label="label"
      class="min-w-0 flex-1"
      @update:model-value="value => patch({ amount: String(value) || null })"
    />
    <Select
      :model-value="model.currency"
      :options="currencies"
      aria-label="币种"
      class="w-28 shrink-0"
      @update:model-value="value => patch({ currency: value ? String(value) : null })"
    />
    <Switch
      :model-value="model.tax_included === true"
      class="shrink-0"
      @update:model-value="value => patch({ tax_included: value })"
    >
      含税
    </Switch>
  </Inline>
  <Textarea v-else-if="long" v-model="text" :aria-label="label" :lang="lang" :min-rows="3" />
  <Input v-else v-model="text" :aria-label="label" :lang="lang" />
</template>
