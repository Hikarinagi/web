<script setup lang="ts">
  import { Inline, Input, Select } from '@hina-ui/vue'
  import type { PropertyDefinition, ValueDraft } from '~/features/wiki/editor/draft'
  import { codeLabel } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldIdentifier' })

  const props = defineProps<{ definition: PropertyDefinition; label: string }>()
  const model = defineModel<ValueDraft>({ required: true })

  const patch = (fields: Partial<ValueDraft>) => (model.value = { ...model.value, ...fields })
  const codes = computed(() =>
    (props.definition.codes ?? []).map(value => ({
      value,
      label: codeLabel(props.definition.property, value),
    })),
  )
  const url = computed(() => props.definition.shape === 'url')
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
    <Select
      v-if="codes.length"
      :model-value="model.code"
      :options="codes"
      :clearable="definition.optional_code"
      aria-label="种类"
      placeholder="种类"
      class="w-40 shrink-0"
      @update:model-value="value => patch({ code: value ? String(value) : null })"
    />
    <Input
      :model-value="model.text ?? ''"
      :type="url ? 'url' : 'text'"
      :inputmode="url ? 'url' : undefined"
      :placeholder="url ? 'https://' : undefined"
      :aria-label="label"
      class="min-w-0 flex-1"
      @update:model-value="value => patch({ text: String(value) || null })"
    />
  </Inline>
</template>
