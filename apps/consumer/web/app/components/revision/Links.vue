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
  <div class="flex flex-wrap items-center gap-1 text-xs leading-none text-muted">
    <NuxtLink :to="historyTo">修订历史</NuxtLink>
    <span aria-hidden="true">/</span>
    <NuxtLink :to="editTo" target="_blank">修订此条目</NuxtLink>
  </div>
</template>
