<script setup lang="ts">
  import { Tag } from '@hina-ui/vue'

  defineOptions({ name: 'CreatorShellUncheckedCount' })

  const { data } = useHikariApiData('/api/v3/wiki/changes', {
    key: 'wiki-unchecked-count',
    query: { unpatrolled: true, page: 1, page_size: 1 },
    lazy: true,
    server: false,
    toast: false,
  })
  const count = computed(() => data.value?.meta.total_items ?? 0)
</script>

<template>
  <Tag v-if="count" size="sm" tone="warning">{{ count > 999 ? '999+' : count }}</Tag>
</template>
