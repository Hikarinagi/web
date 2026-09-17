<script setup lang="ts">
  import { Inline, Tag, Text, type DataTableColumn } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { ClipboardCheck } from '@lucide/vue'
  import type { CreatorReviewPageData } from '~~/server/api/pages/create/review.get'

  defineProps<{ list?: CreatorReviewPageData['pending']; loading: boolean }>()

  type Row = CreatorReviewPageData['pending']['items'][number]

  const page = defineModel<number>('page', { required: true })

  const columns: DataTableColumn<Row>[] = [
    { key: 'resource', label: '条目', minWidth: 224 },
    { key: 'summary', label: '摘要' },
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

  function openDetail(row: Row) {
    void navigateTo(`/create/contributions/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="审核队列"
    :icon="ClipboardCheck"
    :list="list"
    :columns="columns"
    :loading="loading"
    empty-text="暂无待审核的变更请求"
    @row-click="openDetail"
  >
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
