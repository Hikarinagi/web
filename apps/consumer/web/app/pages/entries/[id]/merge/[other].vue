<script setup lang="ts">
  import type { MergePageData } from '~~/server/api/pages/entries/[id]/merge/[other].get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '合并',
  })

  const route = useRoute()
  const { data } = await useHikariApiData<MergePageData>(
    `/api/pages/entries/${String(route.params.id)}/merge/${String(route.params.other)}`,
    { fatal: true },
  )
  useCreatorPage({
    crumbs: () =>
      data.value
        ? [
            { label: data.value.kept.label || '未命名', to: `/entries/${data.value.kept.id}/edit` },
            { label: '合并', to: `/entries/${data.value.kept.id}/merge` },
            { label: data.value.merged.label || '未命名' },
          ]
        : undefined,
  })
</script>

<template>
  <WikiMergeTable v-if="data" :data="data" />
</template>
