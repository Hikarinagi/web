<script setup lang="ts">
  import type { PageResult } from '@hikarinagi/shared'
  import DataTable from 'primevue/datatable'
  import type { Component } from 'vue'
  import type { PaginatorChangePayload } from '~/components/ui/paginator/types'

  type PagedList = PageResult<{ id: number }>

  defineProps<{
    list?: PagedList
    loading?: boolean
    title?: string
    icon?: Component
    count?: number
    description?: string
  }>()
  const page = defineModel<number>('page', { required: true })
  const emit = defineEmits<{ rowClick: [row: { id: number }] }>()

  async function onPage(event: PaginatorChangePayload) {
    await event.ready
    page.value = event.page
  }
</script>

<template>
  <Card>
    <template v-if="title" #title>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="flex items-center gap-2 text-base font-semibold">
          <component :is="icon" v-if="icon" :size="18" class="text-muted-color" />
          {{ title }}
          <span v-if="count !== undefined" class="text-muted-color">（{{ count }}）</span>
        </h2>
        <slot name="actions" />
      </div>
    </template>
    <template #content>
      <p v-if="description" class="mb-4 text-sm text-muted-color">{{ description }}</p>
      <div class="flex flex-col gap-4">
        <slot name="filter" />
        <DataTable
          :value="list?.items ?? []"
          :loading="loading"
          lazy
          scrollable
          data-key="id"
          row-hover
          class="text-sm"
          :pt="{
            bodyRow: { class: 'cursor-pointer' },
            table: { class: 'min-w-max' },
            headerCell: { class: 'whitespace-nowrap' },
            bodyCell: { class: 'whitespace-nowrap' },
          }"
          @row-click="emit('rowClick', $event.data)"
        >
          <template #empty>
            <slot name="empty" />
          </template>
          <slot />
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
      </div>
    </template>
  </Card>
</template>
