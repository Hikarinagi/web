<script setup lang="ts">
  import { Stack, Tag, Text, type DataTableColumn } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { timeFormat } from '#imports'
  import type { Component } from 'vue'
  import { REVIEW_TAG_TONE, reviewStatus } from '~/features/contribute/intake-status'
  import { volumeHead } from '~/features/workbench/volume'

  type List = ApiData<'/api/v3/user/me/epub/corrections', 'get'>
  type Row = List['items'][number]

  defineProps<{
    list?: List | null
    loading: boolean
    title: string
    icon?: Component
    emptyText: string
  }>()
  const page = defineModel<number>('page', { required: true })

  const columns: DataTableColumn<Row>[] = [
    { key: 'volume', label: '分卷' },
    { key: 'status', label: '结果' },
    {
      key: 'created_at',
      label: '提交时间',
      field: 'created_at',
      format: value => timeFormat(value as string),
      cellClass: 'text-muted',
    },
  ]

  function open(row: Row) {
    void navigateTo(`/light-novel-volumes/${row.volume.id}`)
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
    <template #cell-volume="{ row }">
      <CreatorResourceHead
        :id="row.volume.id"
        type="LIGHT_NOVEL_VOLUME"
        :resource="volumeHead(row.volume)"
        size="sm"
        class="py-2"
      />
    </template>
    <template #cell-status="{ row }">
      <Stack gap="xs" align="start" class="py-2">
        <Tag size="sm" :tone="REVIEW_TAG_TONE[(row as Row).status]">
          {{ reviewStatus((row as Row).status).label }}
        </Tag>
        <Text v-if="row.status === 'REJECTED' && row.reasons.length" size="xs" tone="muted">
          {{ row.reasons.join('；') }}
        </Text>
      </Stack>
    </template>
  </CreatorDataTable>
</template>
