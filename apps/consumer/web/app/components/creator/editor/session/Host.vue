<script setup lang="ts">
  import {
    WORKSPACE_SESSION_KEY,
    type WorkspaceEntityTarget,
  } from '~/features/creator/composables/useWorkspaceSession'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'

  const props = defineProps<{
    fields: BackendEditorField[]
    workResourceType: string
  }>()
  const relations = defineModel<Record<string, EditorRelationRow[]>>('relations', {
    required: true,
  })

  const session = inject(WORKSPACE_SESSION_KEY)!

  function onEntityUpdated(payload: {
    target: WorkspaceEntityTarget
    id: number
    name: string
    cover: string | null
  }) {
    for (const field of props.fields) {
      if (field.kind !== 'relation' || field.target !== payload.target) continue
      const rows = relations.value[field.field]
      if (!rows?.some(row => row.target_id === payload.id)) continue
      relations.value = {
        ...relations.value,
        [field.field]: rows.map(row =>
          row.target_id === payload.id
            ? { ...row, target: { name: payload.name, cover: payload.cover } }
            : row,
        ),
      }
    }
  }
</script>

<template>
  <CreatorEditorEntityDrawer
    :editing="session.editing.value"
    @close="session.close()"
    @updated="onEntityUpdated"
  />
  <CreatorEditorSessionSubmitDialog :work-resource-type="workResourceType" />
</template>
