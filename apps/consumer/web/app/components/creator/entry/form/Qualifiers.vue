<script setup lang="ts">
  import { FormField, Inline, Input } from '@hina-ui/vue'
  import type { BackendPropertyDefinition } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'

  defineOptions({ name: 'CreatorEntryFormQualifiers' })
  defineProps<{ definition: BackendPropertyDefinition }>()
  const values = defineModel<StatementValues>('values', { required: true })
</script>

<template>
  <FormField v-if="definition.qualifiers.includes('part')" name="part" label="适用于">
    <Input v-model="values.part" placeholder="例如，第二条路线或片头曲" />
  </FormField>
  <Inline v-if="definition.qualifiers.includes('period')" gap="md" align="start">
    <FormField
      name="period_from"
      label="起始"
      description="若该值始终适用，则两处均留空"
      description-placement="control"
    >
      <Input v-model="values.period_from" class="max-w-40" placeholder="2012-10" />
    </FormField>
    <FormField name="period_to" label="截止">
      <Input v-model="values.period_to" class="max-w-40" placeholder="2013" />
    </FormField>
  </Inline>
</template>
