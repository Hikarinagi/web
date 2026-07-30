<script setup lang="ts">
  import FormField from '@primevue/forms/formfield'
  import type { BackendEditorField, BackendEditorRef } from '~/features/creator/editor'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'

  const props = defineProps<{
    fields: BackendEditorField[]
    presentation: Record<string, EditorFieldPresentation>
    relationErrors: Record<string, string>
    initialRelations: Record<string, EditorRelationRow[]>
    initialValues: Record<string, unknown>
    initialRefs: Record<string, BackendEditorRef>
    formState: Record<string, { value?: unknown } | undefined>
    idPrefix?: string
  }>()
  const relations = defineModel<Record<string, EditorRelationRow[]>>('relations', {
    required: true,
  })

  function updateRelation(field: string, rows: EditorRelationRow[]) {
    relations.value = { ...relations.value, [field]: rows }
  }

  function siblingValues() {
    const out: Record<string, unknown> = {}
    for (const field of props.fields) out[field.field] = props.formState[field.field]?.value
    return out
  }
</script>

<template>
  <div class="flex flex-col gap-5">
    <div
      v-for="field in fields"
      :id="`${idPrefix ?? ''}editor-field-${field.field}`"
      :key="field.field"
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
      <FormField v-else v-slot="$field" :name="field.field">
        <CreatorEditorScalarField
          :field="field"
          :presentation="presentation[field.field]"
          :model-value="$field.value"
          :initial-value="initialValues[field.field]"
          :initial-ref-entity="initialRefs[field.field]"
          :sibling-values="siblingValues()"
          @update:model-value="value => $field.props.onInput({ value })"
        />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple" class="mt-1">
          {{ $field.error?.message }}
        </Message>
      </FormField>
    </div>
  </div>
</template>
