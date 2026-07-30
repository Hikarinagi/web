<script setup lang="ts">
  import { Plus } from '@lucide/vue'
  import type {
    BackendEditorField,
    BackendEditorRef,
    BackendEntitySummary,
  } from '~/features/creator/editor'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import {
    PICKED_REF_REGISTER_KEY,
    REF_APPLY_KEY,
  } from '~/features/creator/composables/useChangeRequestEditor'

  const props = defineProps<{
    field: BackendEditorField
    initialEntity?: BackendEditorRef
    disabled?: boolean
  }>()
  const model = defineModel<number | null>()

  const entity = ref<BackendEditorRef>(props.initialEntity ?? null)
  const dialogOpen = ref(false)
  const initialId = model.value ?? null
  watch(model, v => {
    if (v == null) entity.value = null
    else if (v === initialId) entity.value = props.initialEntity ?? null
  })

  const registerPickedRef = inject(PICKED_REF_REGISTER_KEY, null)
  watch(entity, e => registerPickedRef?.(props.field.field, e), { immediate: true })

  const refApply = inject(REF_APPLY_KEY, null)
  watch(
    () => refApply?.value,
    payload => {
      if (!payload || payload.field !== props.field.field) return
      model.value = payload.id
      entity.value = payload.entity
    },
  )

  const target = computed(() => (props.field.ref_target ?? 'person') as EntityTarget)

  const selectedEntities = computed<BackendEntitySummary[]>(() =>
    entity.value && model.value != null
      ? [
          {
            id: model.value,
            name: entity.value.name,
            cover: entity.value.cover,
            status: 'PUBLISHED' as const,
          },
        ]
      : [],
  )

  const row = computed<EditorRelationRow>(() => ({
    target_id: model.value ?? 0,
    target: entity.value ?? { name: '', cover: null },
    attributes: {},
  }))

  function onPick(items: BackendEntitySummary[]) {
    const first = items[0]
    if (!first) return
    model.value = first.id
    entity.value = { name: first.name, cover: first.cover }
  }

  function clear() {
    model.value = null
    entity.value = null
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <CreatorEditorRelationEntityRow
      v-if="model != null && entity"
      :row="row"
      :attributes="[]"
      :ref-attributes="[]"
      :target="target"
      @remove="clear"
    />
    <Button
      :label="model != null ? '更换' : '选择'"
      severity="secondary"
      variant="outlined"
      class="self-start"
      :disabled="disabled"
      @click="dialogOpen = true"
    >
      <template #icon><Plus :size="14" /></template>
    </Button>
    <CreatorEditorRelationPickerDialog
      v-model:visible="dialogOpen"
      :target="target"
      mode="single"
      :selected-entities="selectedEntities"
      :title="`选择 ${field.ref_target ?? ''}`"
      @select="onPick"
    />
  </div>
</template>
