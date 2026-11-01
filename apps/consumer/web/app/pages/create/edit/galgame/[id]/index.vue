<script setup lang="ts">
  import type { GalgameEditPageData } from '~~/server/api/pages/create/edit/galgame/[id].get'

  definePageMeta({ title: '编辑条目', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const id = Number(route.params.id)

  const { data, refresh } = await useHikariApiData<GalgameEditPageData>(
    `/api/pages/create/edit/galgame/${id}`,
    { fatal: true },
  )
  await redirectIfMerged(data)
</script>

<template>
  <CreatorEntryEditor v-if="data" :page-data="data" @saved="refresh()" />
</template>
