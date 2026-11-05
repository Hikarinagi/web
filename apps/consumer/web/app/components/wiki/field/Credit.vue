<script setup lang="ts">
  import { Inline, Select } from '@hina-ui/vue'
  import type { PropertyDefinition, ValueDraft } from '~/features/wiki/editor/draft'
  import { codeLabel } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldCredit' })

  const props = defineProps<{ definition: PropertyDefinition; label: string }>()
  const model = defineModel<ValueDraft>({ required: true })

  const roles = computed(() =>
    (props.definition.codes ?? []).map(value => ({ value, label: codeLabel('CREDIT', value) })),
  )
  const name = computed({
    get: () => ({ text: model.value.text, target: model.value.target }),
    set: value => (model.value = { ...model.value, ...value }),
  })
</script>

<template>
  <Inline gap="md" align="center" :wrap="false" class="min-w-0 max-md:flex-wrap">
    <Select
      v-if="roles.length > 1"
      :model-value="model.code"
      :options="roles"
      aria-label="职责"
      placeholder="职责"
      class="w-48 shrink-0 max-md:w-auto max-md:flex-1"
      @update:model-value="value => (model = { ...model, code: value ? String(value) : null })"
    />
    <WikiFieldName v-model="name" :label="label" class="min-w-0 flex-1" />
  </Inline>
</template>
