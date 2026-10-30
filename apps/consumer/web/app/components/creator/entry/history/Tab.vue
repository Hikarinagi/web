<script setup lang="ts">
  import { Skeleton } from '@hina-ui/vue'
  import type { PageResult } from '@hikarinagi/shared'
  import type { BackendHistoryRow } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryHistoryTab' })
  const props = defineProps<{
    source: `/api/pages/${string}`
    revisionTo: (revision: number) => string | null
    compareTo: (from: number, to: number) => string
  }>()

  const page = ref(1)
  const { data, pending, refresh } = useHikariApiData<{
    history: PageResult<BackendHistoryRow & { id: number }>
  }>(() => `${props.source}?page=${page.value}`, { lazy: true })
</script>

<template>
  <CreatorEntryHistoryTable
    v-if="data"
    v-model:page="page"
    :history="data.history"
    :loading="pending"
    :revision-to="revisionTo"
    :compare-to="compareTo"
    @changed="refresh()"
  />
  <Skeleton v-else class="h-64 w-full" />
</template>
