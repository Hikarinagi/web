<script setup lang="ts">
  import { Button, Inline, Progress, Text, toast, type DataTableColumn } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import type { Component } from 'vue'
  import { LANGUAGE_LABELS } from '~/features/galgame/labels'
  import { MANGA_MODE_LABEL } from '~/features/workbench/manga/labels'
  import type {
    BackendMangaProjectList,
    BackendMangaProjectListItem,
  } from '~/features/workbench/manga/manga'
  import { projectEpisode, seriesHead } from '~/features/workbench/manga/series'

  const props = defineProps<{
    list?: BackendMangaProjectList | null
    loading: boolean
    title: string
    icon?: Component
    emptyText: string
    purpose: 'mine' | 'review'
  }>()
  const page = defineModel<number>('page', { required: true })
  const emit = defineEmits<{ changed: [] }>()

  type Row = BackendMangaProjectListItem

  const { confirm } = useHikariConfirm()
  const busy = ref<number | null>(null)
  const correcting = ref<Row | null>(null)
  const correctOpen = ref(false)
  const rejecting = ref<Row | null>(null)
  const rejectOpen = ref(false)

  function correct(row: Row) {
    correcting.value = row
    correctOpen.value = true
  }

  function reject(row: Row) {
    rejecting.value = row
    rejectOpen.value = true
  }

  function approve(row: Row) {
    confirm({
      title: '通过并发布',
      description: '批准后，立即将页面发布到本章，读者可以在线阅读。',
      confirmText: '通过',
      cancelText: '取消',
      onConfirm: async () => {
        busy.value = row.id
        try {
          await hikariRequest('/api/v3/manga-projects/{project_id}/approve', {
            method: 'post',
            path: { project_id: row.id },
            body: {},
          })
          toast.success('已通过并发布')
          emit('changed')
        } finally {
          busy.value = null
        }
      },
    })
  }

  const languageLabel = (code: string | null) =>
    code ? (LANGUAGE_LABELS[code as keyof typeof LANGUAGE_LABELS] ?? code) : ''
  const kindLabel = (row: Row) =>
    row.mode === 'TRANSLATION'
      ? `${MANGA_MODE_LABEL.TRANSLATION} · ${languageLabel(row.source_lang)} → ${languageLabel(row.target_lang)}`
      : `${MANGA_MODE_LABEL.UPLOAD} · ${languageLabel(row.source_lang)}`

  const columns = computed<DataTableColumn<Row>[]>(() => [
    { key: 'series', label: '作品' },
    { key: 'episode', label: '话／卷', accessor: projectEpisode, cellClass: 'tabular-nums' },
    {
      key: 'chapter_name',
      label: '标题',
      accessor: (row: Row) => row.chapter_name ?? '',
      cellClass: 'text-muted',
    },
    { key: 'mode', label: '类型', accessor: kindLabel, cellClass: 'text-muted' },
    ...(props.purpose === 'mine'
      ? [
          { key: 'progress', label: '进度' },
          { key: 'status', label: '状态' },
        ]
      : [
          { key: 'preview', label: '预览' },
          {
            key: 'pages',
            label: '页数',
            accessor: (row: Row) => String(row.progress.pages),
            cellClass: 'tabular-nums',
          },
          { key: 'owner', label: '发起人' },
        ]),
    {
      key: 'last_activity_at',
      label: props.purpose === 'mine' ? '最近更新' : '提交时间',
      field: 'last_activity_at',
      format: value => timeFormat(value as string),
      cellClass: 'text-muted',
    },
    ...(props.purpose === 'review' ? [{ key: 'actions', label: '', pin: 'end' as const }] : []),
  ])

  function open(row: Row) {
    void navigateTo(`/create/manga/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    :title="title"
    :icon="icon"
    :list="list ?? undefined"
    :columns="columns"
    :loading="loading"
    :count="list?.meta.total_items"
    :empty-text="emptyText"
    @row-click="open"
  >
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    <template v-if="$slots.filter" #filter><slot name="filter" /></template>
    <template v-if="$slots.empty" #empty><slot name="empty" /></template>
    <template #cell-series="{ row }">
      <CreatorResourceHead
        :id="row.series.id"
        type="MANGA"
        :resource="seriesHead(row.series)"
        size="sm"
        class="py-2"
      />
    </template>
    <template #cell-progress="{ row }">
      <Inline v-if="row.mode === 'TRANSLATION'" gap="sm" align="center" :wrap="false">
        <Progress
          :value="row.progress.rendered"
          :max="Math.max(row.progress.pages, 1)"
          size="sm"
          class="w-24"
        />
        <Text size="xs" tone="muted" class="tabular-nums">
          {{ row.progress.rendered }} / {{ row.progress.pages }} 页
        </Text>
      </Inline>
      <Text v-else size="sm" tone="muted">{{ row.progress.pages }} 页</Text>
    </template>
    <template #cell-status="{ row }">
      <WorkbenchProjectStatusTag :status="row.status" />
    </template>
    <template #cell-owner="{ row }">
      <UserName :user="row.owner" :handle="false" class="py-2 text-sm" />
    </template>
    <template #cell-preview="{ row }">
      <Inline gap="xs" :wrap="false" class="py-1">
        <HikariImage
          v-for="(src, index) in row.preview"
          :key="index"
          :src="src"
          :processing="false"
          alt=""
          class="h-12 w-9 shrink-0 rounded bg-subtle"
          image-class="size-full object-cover object-top"
        >
          <template #empty />
          <template #error />
        </HikariImage>
      </Inline>
    </template>
    <template #cell-actions="{ row }">
      <Inline gap="xs" :wrap="false" justify="end" class="py-1" @click.stop>
        <Button size="sm" variant="ghost" @click="correct(row)">修正</Button>
        <Button size="sm" variant="ghost" tone="danger" @click="reject(row)">驳回</Button>
        <Inline v-tooltip="row.placement_complete ? null : '归类不完整，请先修正'" as="span">
          <Button
            size="sm"
            :disabled="!row.placement_complete"
            :loading="busy === row.id"
            @click="approve(row)"
          >
            通过
          </Button>
        </Inline>
      </Inline>
    </template>
  </CreatorDataTable>
  <WorkbenchMangaProjectInfoDialog
    v-if="correcting"
    v-model:visible="correctOpen"
    :project="correcting"
    purpose="approve"
    @saved="emit('changed')"
  />
  <WorkbenchProjectRejectDialog
    v-if="rejecting"
    v-model:visible="rejectOpen"
    kind="manga"
    :project-id="rejecting.id"
    @rejected="emit('changed')"
  />
</template>
