<script setup lang="ts">
  import { Inline, Progress, Text, type DataTableColumn } from '@hina-ui/vue'
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

  type Row = BackendMangaProjectListItem

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
  </CreatorDataTable>
</template>
