<script setup lang="ts">
  import { FormField, Input, MultiSelect, NumberInput, Select } from '@hina-ui/vue'
  import type { ReferenceParam } from '~~/server/features/developer/reference'
  import type { PlaygroundValue } from '~/features/developer/usePlayground'

  defineOptions({ name: 'DeveloperApiPlaygroundField' })
  const props = defineProps<{ param: ReferenceParam }>()
  const model = defineModel<PlaygroundValue>({ required: true })

  const control = computed(() => props.param.control)
  const required = computed(() => props.param.in === 'path' || props.param.required)

  const text = computed({
    get: () => (Array.isArray(model.value) ? '' : model.value),
    set: value => (model.value = value ?? ''),
  })
  const list = computed({
    get: () => (Array.isArray(model.value) ? model.value : []),
    set: value => (model.value = value),
  })
  const numeric = computed({
    get: () => (text.value === '' ? undefined : Number(text.value)),
    set: value => (text.value = value === undefined || Number.isNaN(value) ? '' : String(value)),
  })

  const BOOLEAN_OPTIONS = [
    { value: 'true', label: '是' },
    { value: 'false', label: '否' },
  ]
</script>

<template>
  <FormField
    :name="param.name"
    :label="param.name"
    :description="param.description ?? param.type"
    :required="required"
  >
    <MultiSelect
      v-if="control.kind === 'enum' && control.multiple"
      v-model="list"
      :options="control.options"
      placeholder="留空"
    />
    <Select
      v-else-if="control.kind === 'enum'"
      v-model="text"
      :options="control.options"
      :placeholder="required ? '请选择' : '留空'"
    />
    <Select
      v-else-if="control.kind === 'boolean'"
      v-model="text"
      :options="BOOLEAN_OPTIONS"
      :placeholder="required ? '请选择' : '留空'"
    />
    <NumberInput
      v-else-if="control.kind === 'number'"
      v-model="numeric"
      :min="control.min"
      :max="control.max"
    />
    <Input v-else v-model="text" :maxlength="control.maxLength" />
  </FormField>
</template>
