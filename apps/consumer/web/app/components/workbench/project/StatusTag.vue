<script setup lang="ts">
  import { Tag } from '@hina-ui/vue'
  import { PROJECT_STATUS_META } from '~/features/workbench/labels'

  const props = defineProps<{ status: string }>()

  const meta = computed(
    () => PROJECT_STATUS_META[props.status] ?? { label: props.status, tone: 'neutral' as const },
  )
</script>

<template>
  <Tag size="sm" :tone="meta.tone">{{ meta.label }}</Tag>
</template>
