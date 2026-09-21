<script setup lang="ts">
  import { FormField } from '@hina-ui/vue'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'

  const props = defineProps<{
    field: BackendEditorField
    presentation?: EditorFieldPresentation
    error?: string
    initialRows?: EditorRelationRow[]
  }>()
  const model = defineModel<EditorRelationRow[]>({ default: () => [] })

  const label = computed(() => props.presentation?.label ?? props.field.field)
  const hint = computed(() => props.field.help ?? props.presentation?.help)
  const isMedia = computed(() => props.field.target === 'media')
  const isTag = computed(() => props.field.target === 'tag')
</script>

<template>
  <FormField
    :required="field.required"
    :error="error"
    :description="hint"
    description-placement="control"
  >
    <template #label>
      {{ label }}
      <CreatorEditorFieldReset v-model="model" :initial="initialRows" />
    </template>

    <CreatorEditorRelationMediaList v-if="isMedia" v-model="model" :field="field" />
    <CreatorEditorRelationTagChips v-else-if="isTag" v-model="model" />
    <CreatorEditorRelationEntityList v-else v-model="model" :field="field" />
  </FormField>
</template>
