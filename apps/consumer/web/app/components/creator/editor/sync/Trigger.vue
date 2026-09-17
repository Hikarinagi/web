<script setup lang="ts">
  import { Alert, Button, Dialog, Empty, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { RefreshCw } from '@lucide/vue'
  import WorkSection from './WorkSection.vue'
  import { EDITOR_VALUES_KEY } from '~/features/creator/composables/useChangeRequestEditor'
  import { useSyncDraft } from '~/features/creator/composables/useSyncDraft'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import type { SyncField, SyncRoster } from '~/features/creator/editor/sync'

  const props = defineProps<{
    resourceType: string
    resourceId?: number | null
    fields: SyncField[]
    presentation: Record<string, { label?: string }>
    relations: Record<string, EditorRelationRow[]>
  }>()
  const emit = defineEmits<{
    add: [field: string, row: EditorRelationRow]
    roster: [roster: SyncRoster]
  }>()

  const values = inject(EDITOR_VALUES_KEY, {})

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
    values: () => values,
    fields: () => props.fields,
    relations: () => props.relations,
    onRoster: roster => emit('roster', roster),
  })

  const section = useTemplateRef<InstanceType<typeof WorkSection>>('section')
  const ready = computed(() => !loading.value && !noIds.value && !failed.value && !nothing.value)

  const notice = computed(() => {
    if (noIds.value)
      return {
        tone: 'warning' as const,
        text: '此条目没有登记 Bangumi / VNDB 外部源 ID，无法同步。先在外部源 ID 字段填入后再试。',
      }
    if (failed.value) return { tone: 'danger' as const, text: '拉取外部源数据失败，关闭后重试' }
    return null
  })
  const noticeText = ref('')
  watch(notice, value => {
    if (value) noticeText.value = value.text
  })
</script>

<template>
  <Button v-if="cfg" variant="ghost" tone="neutral" size="sm" @click="open">
    <template #icon><RefreshCw /></template>
    从外部源同步
  </Button>

  <Dialog v-model:open="visible" title="从外部源同步" size="2xl">
    <template #content>
      <Alert :open="!!notice" :tone="notice?.tone ?? 'warning'">{{ noticeText }}</Alert>
      <Stack v-if="loading" gap="sm">
        <Skeleton v-for="i in 4" :key="i" class="h-16" />
      </Stack>
      <Empty v-else-if="nothing" size="sm" title="当前数据已与外部源一致，没有可同步的内容">
        <Text size="xs" tone="muted">已对比：{{ comparedSources }}</Text>
      </Empty>
      <WorkSection
        v-else-if="ready"
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
