<script setup lang="ts">
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  definePageMeta({ layout: 'workbench' })

  const route = useRoute()
  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const chapter = Number(route.query.chapter)
    const query = Number.isInteger(chapter) && chapter > 0 ? `?chapter=${chapter}` : ''
    return `/api/pages/create/projects/${Number(route.params.id)}${query}`
  })
  const { data, pending, refresh } = await useHikariApiData<WorkbenchProjectPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <WorkbenchNovelEditor v-if="data" :data="data" :pending="pending" @refresh="refresh" />
</template>
