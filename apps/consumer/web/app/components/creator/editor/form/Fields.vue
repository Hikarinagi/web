<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { BackendEditorField, BackendEditorRef } from '~/features/creator/editor'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'

  defineProps<{
    fields: BackendEditorField[]
    presentation: Record<string, EditorFieldPresentation>
    relationErrors: Record<string, string>
    initialRelations: Record<string, EditorRelationRow[]>
    initialValues: Record<string, unknown>
    initialRefs: Record<string, BackendEditorRef>
    idPrefix?: string
  }>()
  const relations = defineModel<Record<string, EditorRelationRow[]>>('relations', {
    required: true,
  })
  const values = defineModel<Record<string, unknown>>('values', { required: true })

  function updateRelation(field: string, rows: EditorRelationRow[]) {
    relations.value = { ...relations.value, [field]: rows }
  }
</script>

<template>
  <Stack gap="lg">
    <Stack
      v-for="field in fields"
      :id="`${idPrefix ?? ''}editor-field-${field.field}`"
      :key="field.field"
      gap="none"
      :data-editor-field="field.field"
      class="scroll-mt-20"
    >
      <CreatorEditorRelationField
        v-if="field.kind === 'relation'"
        :model-value="relations[field.field]"
        :field="field"
        :presentation="presentation[field.field]"
        :error="relationErrors[field.field]"
        :initial-rows="initialRelations[field.field]"
        @update:model-value="rows => updateRelation(field.field, rows)"
      />
      <CreatorEditorScalarField
        v-else
        v-model="values[field.field]"
        :field="field"
        :presentation="presentation[field.field]"
        :initial-value="initialValues[field.field]"
        :initial-ref-entity="initialRefs[field.field]"
        :sibling-values="values"
      />
    </Stack>
  </Stack>
</template>
