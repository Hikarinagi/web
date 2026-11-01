<script setup lang="ts">
  import { Tag } from '@hina-ui/vue'

  defineProps<{ status: 'PENDING' | 'APPROVED' | 'REJECTED' }>()

  const STATUS_META = {
    PENDING: { label: '待处理', tone: 'warning' },
    APPROVED: { label: '已通过', tone: 'success' },
    REJECTED: { label: '已驳回', tone: 'danger' },
  } as const
</script>

<template>
  <Tag size="sm" :tone="STATUS_META[status].tone">{{ STATUS_META[status].label }}</Tag>
</template>
