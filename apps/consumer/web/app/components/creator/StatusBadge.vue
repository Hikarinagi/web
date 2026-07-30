<script setup lang="ts">
  import type { BackendChangeRequestSummary } from '~/features/creator/contribution'

  const props = defineProps<{ status: BackendChangeRequestSummary['status'] }>()

  const STATUS_META = {
    PENDING: { label: '待审核', severity: 'warn' },
    MERGED: { label: '已合并', severity: 'success' },
    REJECTED: { label: '已驳回', severity: 'danger' },
    CLOSED: { label: '已关闭', severity: 'contrast' },
  } as const

  const meta = computed(() => STATUS_META[props.status])
</script>

<template>
  <Tag :value="meta.label" :severity="meta.severity" :pt="{ root: { class: 'text-xs!' } }" />
</template>
