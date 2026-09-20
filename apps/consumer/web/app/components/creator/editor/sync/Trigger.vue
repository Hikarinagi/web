<script setup lang="ts">
  import type { FormInstance } from '@primevue/forms/form'
  import { RefreshCw } from '@lucide/vue'
  import { useSyncDraft } from '~/features/creator/composables/useSyncDraft'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import type { SyncField, SyncRoster } from '~/features/creator/editor/sync'

  const props = defineProps<{
    resourceType: string
    resourceId?: number | null
    formEl: FormInstance | null
    fields: SyncField[]
    presentation: Record<string, { label?: string }>
    relations: Record<string, EditorRelationRow[]>
  }>()
  const emit = defineEmits<{
    add: [field: string, row: EditorRelationRow]
    roster: [roster: SyncRoster]
  }>()

  const {
    cfg,
    coverField,
    visible,
    loading,
    noIds,
    failed,
    scalars,
    rels,
    cover,
    author,
    screenshots,
    tags,
    nothing,
    comparedSources,
    open,
  } = useSyncDraft({
    resourceType: () => props.resourceType,
    resourceId: () => props.resourceId,
    formEl: () => props.formEl,
    fields: () => props.fields,
    relations: () => props.relations,
    onRoster: roster => emit('roster', roster),
  })
</script>

<template>
  <Button
    v-if="cfg"
    type="button"
    label="从外部源同步"
    severity="secondary"
    text
    size="small"
    @click="open"
  >
    <template #icon><RefreshCw :size="15" /></template>
  </Button>

  <Dialog
    v-model:visible="visible"
    modal
    header="从外部源同步"
    class="w-full max-w-2xl"
    :dismissable-mask="true"
  >
    <div v-if="loading" class="flex flex-col gap-3">
      <Skeleton v-for="i in 4" :key="i" height="4rem" />
    </div>
    <Message v-else-if="noIds" severity="warn" variant="simple" size="small">
      此条目没有登记 Bangumi / VNDB 外部源 ID，无法同步。先在外部源 ID 字段填入后再试。
    </Message>
    <Message v-else-if="failed" severity="error" variant="simple" size="small">
      拉取外部源数据失败，关闭后重试
    </Message>
    <div v-else-if="nothing" class="flex flex-col items-center gap-2 py-6 text-center">
      <p class="text-sm text-muted-color">当前数据已与外部源一致，没有可同步的内容。</p>
      <p class="text-xs text-muted-color">已对比：{{ comparedSources }}</p>
    </div>
    <CreatorEditorSyncWorkSection
      v-else
      :scalars="scalars"
      :rels="rels"
      :cover="cover"
      :cover-field="coverField"
      :author="author"
      :screenshots="screenshots"
      :tags="tags"
      :presentation="presentation"
      :fields="fields"
      :form-el="formEl"
      :compared-sources="comparedSources"
      :relation-field="cfg?.relationField ?? null"
      @add="(field, row) => emit('add', field, row)"
      @applied="visible = false"
    />
  </Dialog>
</template>
