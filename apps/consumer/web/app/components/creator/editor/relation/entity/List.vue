<script setup lang="ts">
  import { Plus } from '@lucide/vue'
  import type { BackendEditorField, BackendEntitySummary } from '~/features/creator/editor'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import {
    WORKSPACE_SESSION_KEY,
    type WorkspaceEntityTarget,
  } from '~/features/creator/composables/useWorkspaceSession'
  import {
    IN_ENTITY_DRAWER_KEY,
    toRelationRows,
    type EditorRelationRow,
  } from '~/features/creator/editor/relation'

  const props = defineProps<{ field: BackendEditorField }>()
  const model = defineModel<EditorRelationRow[]>({ default: () => [] })

  const rows = computed(() => toRelationRows(model.value))
  const attributes = computed(() => props.field.attributes ?? [])
  const refAttributes = computed(() => props.field.ref_attributes ?? [])
  const target = computed(() => (props.field.target ?? '') as EntityTarget)
  const rowIdentity = computed(() => props.field.row_identity === true)

  const pickerOpen = ref(false)

  const EDITABLE_TARGETS = new Set(['person', 'producer', 'character'])
  const inDrawer = inject(IN_ENTITY_DRAWER_KEY, false)
  const session = inject(WORKSPACE_SESSION_KEY, null)
  const editable = computed(() => !inDrawer && !!session && EDITABLE_TARGETS.has(target.value))

  function openEditor(row: EditorRelationRow) {
    if (!editable.value) return
    session!.open(target.value as WorkspaceEntityTarget, row.target_id)
  }

  function dirtyCount(row: EditorRelationRow): number {
    return session?.memberFor(target.value, row.target_id)?.changeset.length ?? 0
  }

  const selectedEntities = computed<BackendEntitySummary[]>(() =>
    rowIdentity.value
      ? []
      : rows.value.map(row => ({
          id: row.target_id,
          name: row.target.name,
          cover: row.target.cover,
          status: 'PUBLISHED' as const,
        })),
  )

  function onPick(items: BackendEntitySummary[]) {
    if (rowIdentity.value) {
      model.value = [
        ...rows.value,
        ...items.map(item => ({
          target_id: item.id,
          target: { name: item.name, cover: item.cover },
          attributes: {},
        })),
      ]
      return
    }
    const existing = new Map(rows.value.map(row => [row.target_id, row]))
    model.value = items.map(item => {
      const prev = existing.get(item.id)
      return prev
        ? prev
        : {
            target_id: item.id,
            target: { name: item.name, cover: item.cover },
            attributes: {},
          }
    })
  }

  function updateRow(index: number, row: EditorRelationRow) {
    model.value = rows.value.map((current, i) => (i === index ? row : current))
  }

  function removeRow(index: number) {
    model.value = rows.value.filter((_, i) => i !== index)
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <CreatorEditorRelationEntityRow
      v-for="(row, index) in rows"
      :key="row.relation_id ?? `draft-${index}-${row.target_id}`"
      :row="row"
      :attributes="attributes"
      :ref-attributes="refAttributes"
      :target="target"
      :editable="editable"
      :dirty-count="dirtyCount(row)"
      @update:row="updated => updateRow(index, updated)"
      @remove="removeRow(index)"
      @edit="openEditor(row)"
    />
    <Button
      label="添加"
      severity="secondary"
      variant="outlined"
      class="self-start"
      @click="pickerOpen = true"
    >
      <template #icon><Plus :size="14" /></template>
    </Button>
    <CreatorEditorRelationPickerDialog
      v-model:visible="pickerOpen"
      :target="target"
      :mode="rowIdentity ? 'single' : 'multi'"
      :selected-entities="selectedEntities"
      :title="`添加 ${target}`"
      @select="onPick"
    />
  </div>
</template>
