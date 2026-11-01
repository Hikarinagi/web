<script setup lang="ts">
  import type { EntryEditPageData } from '~~/server/api/pages/create/edit/entry/[id].get'

  definePageMeta({ title: '编辑条目', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const { data, refresh } = await useHikariApiData<EntryEditPageData>(
    () => `/api/pages/create/edit/entry/${Number(route.params.id)}`,
    { fatal: true },
  )
  if (data.value?.target)
    await navigateTo({ path: data.value.target, query: route.query }, { replace: true })
</script>

<template>
  <CreatorEntryStandardEditor v-if="data?.editor" :page-data="data.editor" @saved="refresh()" />
</template>
