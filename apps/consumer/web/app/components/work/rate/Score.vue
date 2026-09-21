<script setup lang="ts">
  import { FormField, Inline, Rating, Tag } from '@hina-ui/vue'

  defineOptions({ name: 'WorkRateScore' })
  defineProps<{ required?: boolean }>()

  const model = defineModel<number | null>({ required: true })
</script>

<template>
  <FormField name="rate" label="评分" :required="required">
    <Inline align="center" gap="sm">
      <Rating
        :model-value="model ?? 0"
        :max="10"
        size="lg"
        @update:model-value="value => (model = value === 0 ? null : value)"
      />
      <Tag v-if="model != null" tone="warning" size="md" class="tabular-nums">
        {{ model.toFixed(1) }}
      </Tag>
      <Tag v-else size="md">未评分</Tag>
    </Inline>
  </FormField>
</template>
