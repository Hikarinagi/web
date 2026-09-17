<script setup lang="ts" generic="T extends { id: number }">
  import { DataTable, Panel, Stack, type DataTableColumn } from '@hina-ui/vue'
  import type { PageResult } from '@hikarinagi/shared'
  import type { Component } from 'vue'
  import type { PaginatorChangePayload } from '~/components/ui/paginator/types'

  defineProps<{
    list?: PageResult<T>
    columns: DataTableColumn<T>[]
    loading?: boolean
    title: string
    icon?: Component
    count?: number
    description?: string
    emptyText?: string
  }>()
  const page = defineModel<number>('page', { required: true })
  const emit = defineEmits<{ rowClick: [row: T] }>()

  const slots = useSlots()
  const cellSlots = computed(() =>
    Object.keys(slots).filter(name => name.startsWith('cell-') || name.startsWith('header-')),
  )

  async function onPage(event: PaginatorChangePayload) {
    await event.ready
    page.value = event.page
  }
</script>

<template>
  <Panel :title="title" :description="description" :count="count">
    <template v-if="icon" #icon><component :is="icon" /></template>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>

    <Stack gap="md">
      <slot name="filter" />

      <DataTable
        :rows="list?.items ?? []"
        :columns="columns"
        :row-key="row => row.id"
        :loading="loading"
        :label="title"
        :empty-text="emptyText"
        variant="secondary"
        manual
        row-clickable
        @row-click="row => emit('rowClick', row)"
      >
        <template v-for="name in cellSlots" #[name]="scope" :key="name">
          <slot :name="name" v-bind="scope" />
        </template>
        <template v-if="$slots.empty" #empty><slot name="empty" /></template>
      </DataTable>

      <Paginator
        v-if="list && list.meta.total_items > list.meta.page_size"
        v-model:page="page"
        :meta="list.meta"
        :loading="loading"
        show-jump
        align="between"
        @change="onPage"
      />
    </Stack>
  </Panel>
</template>
