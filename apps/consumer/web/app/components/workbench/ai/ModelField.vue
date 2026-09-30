<script setup lang="ts">
  import { FormField, Select } from '@hina-ui/vue'
  import type { BackendAiModel } from '~/features/workbench/workbench'

  const props = defineProps<{
    label: string
    models: BackendAiModel[]
    unit: 'kchar' | 'page'
  }>()
  const model = defineModel<string | null>({ required: true })

  const options = computed(() =>
    props.models.map(item => ({
      value: item.key,
      label:
        props.unit === 'kchar'
          ? `${item.name} · 每千字约 ${item.credits_per_kchar} 积分`
          : `${item.name} · 每页约 ${item.credits_per_page} 积分`,
    })),
  )
  const description = computed(
    () => props.models.find(item => item.key === model.value)?.description ?? undefined,
  )
</script>

<template>
  <FormField :label="label" :description="description" description-placement="control">
    <Select
      :model-value="model"
      :options="options"
      @update:model-value="value => (model = typeof value === 'string' ? value : null)"
    />
  </FormField>
</template>
