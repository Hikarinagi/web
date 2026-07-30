<script setup lang="ts">
  defineProps<{ status: 'PENDING' | 'APPROVED' | 'REJECTED' }>()

  const STATUS_META = {
    PENDING: { label: '待处理', severity: 'warn' },
    APPROVED: { label: '已通过', severity: 'success' },
    REJECTED: { label: '已驳回', severity: 'danger' },
  } as const
</script>

<template>
  <Tag
    :value="STATUS_META[status].label"
    :severity="STATUS_META[status].severity"
    :pt="{ root: { class: 'text-xs!' } }"
  />
</template>
