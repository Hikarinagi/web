<script setup lang="ts">
  import { Alert } from '@hina-ui/vue'
  import type { BackendEditableEntry } from '~/features/creator/entry/contract'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'CreatorEntryProtection' })
  const props = defineProps<{ protection: BackendEditableEntry['protection'] }>()

  const locked = computed(() => props.protection?.level === 'LOCKED')
  const body = computed(() => {
    const protection = props.protection
    if (!protection) return ''
    const parts = [
      locked.value
        ? protection.reason
          ? `仅巡查者可编辑。原因：${protection.reason}`
          : '仅巡查者可编辑。'
        : '',
      protection.until ? `锁定至 ${revisionTime(protection.until)}` : '',
    ]
    return parts.filter(Boolean).join(' ')
  })
</script>

<template>
  <Alert
    :open="Boolean(protection)"
    :tone="locked ? 'warning' : 'info'"
    :title="locked ? '该条目已锁定' : '新成员对本条目的编辑将在生效前公示'"
  >
    {{ body }}
  </Alert>
</template>
