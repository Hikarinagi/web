<script setup lang="ts">
  import { timeFormat } from '#imports'
  import { ClipboardCheck } from '@lucide/vue'
  import type { CreatorReviewPageData } from '~~/server/api/pages/create/review.get'

  defineProps<{ list?: CreatorReviewPageData['pending']; loading: boolean }>()
  const page = defineModel<number>('page', { required: true })

  function openDetail(row: { id: number }) {
    void navigateTo(`/create/contributions/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="审核队列"
    :icon="ClipboardCheck"
    :list="list"
    :loading="loading"
    @row-click="openDetail"
  >
    <template #empty>
      <CreatorEmpty text="暂无待审核的变更请求" />
    </template>
    <Column header="资源" class="min-w-56">
      <template #body="{ data: row }">
        <CreatorResourceHead
          :id="row.primary.resource_id"
          size="sm"
          :type="row.primary.resource_type"
          :resource="row.primary.resource"
        />
      </template>
    </Column>
    <Column header="摘要">
      <template #body="{ data: row }">
        <span class="flex items-center gap-2">
          <span class="line-clamp-1">{{ row.primary.summary }}</span>
          <Tag
            v-if="row.bundled.length"
            :value="`捆绑 ${row.bundled.length} 个新实体`"
            severity="secondary"
            class="shrink-0"
          />
        </span>
      </template>
    </Column>
    <Column header="提交者" class="w-40">
      <template #body="{ data: row }">
        <span class="flex items-center gap-1.5">
          <Avatar :user="row.primary.author" card shape="circle" class="size-5!" />
          <UserName :user="row.primary.author" :handle="false" class="truncate" />
        </span>
      </template>
    </Column>
    <Column header="提交时间" class="w-40">
      <template #body="{ data: row }">
        <span class="text-muted-color">{{ timeFormat(row.primary.created_at) }}</span>
      </template>
    </Column>
  </CreatorDataTable>
</template>
