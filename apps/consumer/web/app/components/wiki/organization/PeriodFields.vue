<script setup lang="ts">
  import { Inline, Input, Text } from '@hina-ui/vue'
  import { dateInput, parseDate } from '~/features/wiki/editor/inputs'
  import type { RelationRow } from '~/features/wiki/editor/relations'

  defineOptions({ name: 'WikiOrganizationPeriodFields' })

  const model = defineModel<RelationRow['period']>({ required: true })

  function date(side: 'from' | 'to', text: string) {
    const parsed = parseDate(text)
    model.value =
      side === 'from'
        ? { ...model.value, period_from: parsed.date, period_from_precision: parsed.precision }
        : { ...model.value, period_to: parsed.date, period_to_precision: parsed.precision }
  }
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false">
    <Text size="sm" class="shrink-0">期间</Text>
    <Input
      :model-value="dateInput(model.period_from, model.period_from_precision)"
      aria-label="期间开始"
      placeholder="开始"
      class="w-32"
      @update:model-value="value => date('from', String(value))"
    />
    <Text size="sm" tone="muted">至</Text>
    <Input
      :model-value="dateInput(model.period_to, model.period_to_precision)"
      aria-label="期间结束"
      placeholder="结束"
      class="w-32"
      @update:model-value="value => date('to', String(value))"
    />
  </Inline>
</template>
