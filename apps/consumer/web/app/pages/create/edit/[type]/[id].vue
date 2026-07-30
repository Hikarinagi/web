<script setup lang="ts">
  import type { CreatorEditorPageData } from '~~/server/api/pages/create/editor/[type]/[id].get'

  definePageMeta({ title: '编辑', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const type = computed(() => String(route.params.type))
  const id = computed(() => Number(route.params.id))

  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/editor/${type.value}/${id.value}`,
  )
  const { data } = await useHikariApiData<CreatorEditorPageData>(requestUrl, { fatal: true })
</script>

<template>
  <CreatorEditorShell v-if="data" :page-data="data" :resource-type="type" :resource-id="id" />
</template>
