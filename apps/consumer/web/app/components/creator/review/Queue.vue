<script setup lang="ts">
  import { Inline, SegmentedControl, Tag, Text, type DataTableColumn } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { ClipboardCheck } from '@lucide/vue'
  import { checkTags } from '~/features/creator/check'
  import type { CreatorReviewPageData } from '~~/server/api/pages/create/review.get'

  const props = defineProps<{
    list?: CreatorReviewPageData['pending']
    counts?: CreatorReviewPageData['counts']
    loading: boolean
  }>()

  type Row = CreatorReviewPageData['pending']['items'][number]

  const page = defineModel<number>('page', { required: true })
  const check = defineModel<'all' | 'disputed' | 'running'>('check', { required: true })

  const filters = computed(() => [
    { label: `全部 ${props.counts?.all ?? ''}`.trim(), value: 'all' },
    { label: `核对有异议 ${props.counts?.disputed ?? ''}`.trim(), value: 'disputed' },
    { label: `核对中 ${props.counts?.running ?? ''}`.trim(), value: 'running' },
  ])

  function filter(value: string | number | undefined) {
    if (value !== 'all' && value !== 'disputed' && value !== 'running') return
    check.value = value
    page.value = 1
  }

  const columns: DataTableColumn<Row>[] = [
    { key: 'resource', label: '条目', minWidth: 224 },
    { key: 'summary', label: '摘要' },
    { key: 'check', label: '核对' },
    { key: 'author', label: '提交者', width: 160 },
    {
      key: 'created_at',
      label: '提交时间',
      width: 160,
      accessor: row => row.primary.created_at,
      format: value => timeFormat(value as string),
      cellClass: 'text-muted',
    },
  ]

  function suspected(row: Row) {
    return (row.primary.duplicate_check?.candidates ?? []).some(
      item => item.level === 'likely' || item.level === 'on_site',
    )
  }

  function openDetail(row: Row) {
    void navigateTo(`/create/contributions/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="待审核的变更请求"
    :icon="ClipboardCheck"
    :list="list"
    :columns="columns"
    :loading="loading"
    empty-text="暂无待审核的变更请求"
    @row-click="openDetail"
  >
    <template #filter>
      <SegmentedControl
        size="sm"
        :options="filters"
        :model-value="check"
        aria-label="筛选"
        @update:model-value="filter"
      />
    </template>
    <template #cell-resource="{ row }">
      <CreatorResourceHead
        :id="row.primary.resource_id"
        size="sm"
        :type="row.primary.resource_type"
        :resource="row.primary.resource"
        class="py-2"
      />
    </template>
    <template #cell-summary="{ row }">
      <Inline gap="sm" align="center" :wrap="false">
        <Text as="span" size="sm" truncate class="min-w-0">{{ row.primary.summary }}</Text>
        <Tag v-if="row.bundled.length" size="sm" tone="neutral" class="shrink-0">
          捆绑 {{ row.bundled.length }} 个新实体
        </Tag>
        <Tag v-if="suspected(row)" size="sm" tone="warning" class="shrink-0">疑似重复</Tag>
      </Inline>
    </template>
    <template #cell-check="{ row }">
      <Inline gap="xs" class="py-2">
        <Tag v-for="tag in checkTags(row.primary.check)" :key="tag.text" size="sm" :tone="tag.tone">
          {{ tag.text }}
        </Tag>
      </Inline>
    </template>
    <template #cell-author="{ row }">
      <Inline gap="xs" align="center" :wrap="false">
        <Avatar :user="row.primary.author" card class="size-5!" />
        <UserName :user="row.primary.author" :handle="false" class="truncate" />
      </Inline>
    </template>
  </CreatorDataTable>
</template>
