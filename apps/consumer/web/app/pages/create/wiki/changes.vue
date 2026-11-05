<script setup lang="ts">
  import { CHANGE_TITLES, changesBff, readChangesQuery } from '~/features/wiki/changes'
  import type { ChangesPageData } from '~~/server/api/pages/create/wiki/changes.get'

  definePageMeta({ title: '全部修改' })

  const route = useRoute()
  const { data } = await useHikariApiData<ChangesPageData>(
    changesBff(readChangesQuery(route.query)),
    {
      fatal: true,
      watch: false,
    },
  )
  const title = computed(() => CHANGE_TITLES[readChangesQuery(route.query).f])
  useCreatorPage({
    title,
    crumbs: () => (route.params.id ? undefined : [{ label: title.value }]),
  })
</script>

<template>
  <WikiChangesShell v-if="data" :initial="data">
    <NuxtPage />
  </WikiChangesShell>
</template>
