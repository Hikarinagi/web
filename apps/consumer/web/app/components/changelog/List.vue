<script setup lang="ts">
  defineOptions({ name: 'ChangelogList' })

  const { data, pending } = useHikariApiData('/api/v3/site/releases', {
    query: { target: 'SITE' },
    lazy: true,
  })
</script>

<template>
  <div v-if="pending" class="flex flex-col gap-4">
    <Skeleton v-for="index in 3" :key="index" height="5rem" />
  </div>

  <div v-else-if="data?.items.length" class="flex flex-col">
    <ChangelogEntry
      v-for="entry in data.items"
      :key="entry.version"
      :version="entry.version"
      :released-at="entry.released_at"
      :sections="entry.sections"
    />
  </div>

  <p v-else class="py-8 text-center text-sm text-muted-color">还没有更新记录</p>
</template>
