<script setup lang="ts">
  import { Alert, Button, Dialog, Empty, Skeleton, Stack, Text } from '@hina-ui/vue'
  import type { FormInstance } from '@primevue/forms/form'
  import { RefreshCw } from '@lucide/vue'
  import WorkSection from './WorkSection.vue'
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

  const section = useTemplateRef<InstanceType<typeof WorkSection>>('section')
  const ready = computed(() => !loading.value && !noIds.value && !failed.value && !nothing.value)
</script>

<template>
  <Button v-if="cfg" variant="ghost" tone="neutral" size="sm" @click="open">
    <template #icon><RefreshCw /></template>
    从外部源同步
  </Button>

  <Dialog v-model:open="visible" title="从外部源同步" size="2xl">
    <template #content>
      <Stack v-if="loading" gap="sm">
        <Skeleton v-for="i in 4" :key="i" class="h-16" />
      </Stack>
      <Alert v-else-if="noIds" tone="warning">
        此条目没有登记 Bangumi / VNDB 外部源 ID，无法同步。先在外部源 ID 字段填入后再试。
      </Alert>
      <Alert v-else-if="failed" tone="danger">拉取外部源数据失败，关闭后重试</Alert>
      <Empty v-else-if="nothing" size="sm" title="当前数据已与外部源一致，没有可同步的内容">
        <Text size="xs" tone="muted">已对比：{{ comparedSources }}</Text>
      </Empty>
      <WorkSection
        v-else
        ref="section"
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
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="section?.applying" @click="visible = false">
        关闭
      </Button>
      <Button v-if="ready" :loading="section?.applying" @click="section?.apply()">应用所选</Button>
    </template>
  </Dialog>
</template>
