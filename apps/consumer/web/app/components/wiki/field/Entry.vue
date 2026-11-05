<script setup lang="ts">
  import { Inline, Input, Select } from '@hina-ui/vue'
  import type { PropertyDefinition, ValueDraft } from '~/features/wiki/editor/draft'
  import { codeLabel, relationPhrase } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldEntry' })

  const props = defineProps<{ definition: PropertyDefinition; label: string }>()
  const model = defineModel<ValueDraft>({ required: true })

  const patch = (fields: Partial<ValueDraft>) => (model.value = { ...model.value, ...fields })
  const target = computed({
    get: () => model.value.target,
    set: value => patch({ target: value }),
  })
  const related = computed(
    () =>
      props.definition.property === 'GAME_RELATION' ||
      props.definition.property === 'SERIES_RELATION',
  )
  const codes = computed(() =>
    (props.definition.codes ?? []).map(value => ({
      value,
      label: related.value
        ? relationPhrase(props.definition.property, value, 'other')
        : codeLabel(props.definition.property, value),
    })),
  )
</script>

<template>
  <Inline gap="sm" align="center" class="min-w-0">
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
    <WikiFieldTarget
      v-model="target"
      :types="definition.targets"
      :label="label"
      class="min-w-0 flex-1"
    />
    <Input
      v-if="definition.note"
      :model-value="model.text ?? ''"
      aria-label="附注"
      placeholder="附注"
      class="w-40 shrink-0"
      @update:model-value="value => patch({ text: String(value) || null })"
    />
  </Inline>
</template>
