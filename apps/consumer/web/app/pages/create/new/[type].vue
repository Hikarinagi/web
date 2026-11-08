<script setup lang="ts">
  import type { CreatorNewEditorPageData } from '~~/server/api/pages/create/editor/new/[type].get'

  definePageMeta({ title: '新建条目', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const type = computed(() => String(route.params.type))

  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string' && value) params.set(key, value)
    }
    const qs = params.toString()
    return `/api/pages/create/editor/new/${type.value}${qs ? `?${qs}` : ''}`
  })
  const { data } = await useHikariApiData<CreatorNewEditorPageData>(requestUrl, { fatal: true })

  if (data.value?.existing_id) {
    await navigateTo(`/create/edit/${type.value}/${data.value.existing_id}`, { replace: true })
  }
</script>

<template>
  <CreatorEditorShell v-if="data" :page-data="data" :resource-type="type" :resource-id="null" />
</template>
