<script setup lang="ts">
  import { Empty, Skeleton, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'ChangelogList' })

  const { data, pending } = useHikariApiData('/api/v3/site/releases', {
    query: { target: 'SITE' },
    lazy: true,
  })
</script>

<template>
  <Stack v-if="pending" gap="md">
    <Skeleton v-for="index in 3" :key="index" class="h-20" />
  </Stack>

  <Stack v-else-if="data?.items.length" gap="none">
    <ChangelogEntry
      v-for="entry in data.items"
      :key="entry.version"
      :version="entry.version"
      :released-at="entry.released_at"
      :sections="entry.sections"
    />
  </Stack>

  <Empty v-else size="sm" title="还没有更新记录" />
</template>
