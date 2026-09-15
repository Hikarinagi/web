<script setup lang="ts" generic="T extends string">
  import { FormField, SegmentedControl, type SelectOption } from '@hina-ui/vue'

  defineOptions({ name: 'WorkRateStatusPills' })
  defineProps<{ options: SelectOption[] }>()

  const model = defineModel<T>({ required: true })
</script>

<template>
  <FormField name="status" label="标记" required>
    <SegmentedControl
      :model-value="model"
      :options="options"
      block
      @update:model-value="value => (model = value as T)"
    />
  </FormField>
</template>
