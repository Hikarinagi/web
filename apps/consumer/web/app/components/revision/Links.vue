<script setup lang="ts">
  import {
    getRevisionEditPath,
    getRevisionHistoryPath,
    type RevisionResourceSlug,
  } from '~/features/revision/resources'

  const props = defineProps<{
    resourceType: RevisionResourceSlug
    resourceId: number
  }>()

  const historyTo = computed(() => getRevisionHistoryPath(props.resourceType, props.resourceId))
  const editTo = computed(() => getRevisionEditPath(props.resourceType, props.resourceId))
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-1 text-[11px] leading-none text-surface-500 dark:text-surface-400"
  >
    <NuxtLink :to="historyTo">修订历史</NuxtLink>
    <span aria-hidden="true">/</span>
    <NuxtLink :to="editTo" target="_blank">修订此条目</NuxtLink>
  </div>
</template>
