<script setup lang="ts">
  import { Tag } from '@hina-ui/vue'
  import type { BackendChangeRequestSummary } from '~/features/creator/contribution'

  const props = defineProps<{ status: BackendChangeRequestSummary['status'] }>()

  const STATUS_META = {
    PENDING: { label: '待审核', tone: 'warning' },
    MERGED: { label: '已合并', tone: 'success' },
    REJECTED: { label: '已驳回', tone: 'danger' },
    CLOSED: { label: '已关闭', tone: 'neutral' },
  } as const

  const meta = computed(() => STATUS_META[props.status])
</script>

<template>
  <Tag size="sm" :tone="meta.tone">{{ meta.label }}</Tag>
</template>
