<script setup lang="ts">
  import { CHANGE_TITLES, changesBff, readChangesQuery } from '~/features/wiki/changes'
  import type { ChangesPageData } from '~~/server/api/pages/create/wiki/changes.get'

  definePageMeta({
    layout: 'creator',
    middleware: 'auth',
    floatingToolbar: false,
    title: '全部修改',
    fill: true,
  })

  const route = useRoute()
  const { data, error, status, refresh } = useHikariApiData<ChangesPageData>(
    changesBff(readChangesQuery(route.query)),
    { watch: false },
  )
  const title = computed(() => CHANGE_TITLES[readChangesQuery(route.query).f])
  useCreatorPage({
    title,
    crumbs: () => (route.params.id ? undefined : [{ label: title.value }]),
    loading: () => status.value === 'pending',
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiChangesShell v-else-if="data" :initial="data">
    <NuxtPage />
  </WikiChangesShell>
</template>
