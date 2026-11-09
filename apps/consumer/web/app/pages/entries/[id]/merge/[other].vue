<script setup lang="ts">
  import type { MergePageData } from '~~/server/api/pages/entries/[id]/merge/[other].get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '合并',
    fill: true,
  })

  const route = useRoute()
  const request = computed(
    () =>
      `/api/pages/entries/${String(route.params.id)}/merge/${String(route.params.other)}` as `/api/pages/${string}`,
  )
  const { data, error, status, refresh } = useHikariApiData<MergePageData>(request)
  useCreatorPage({
    loading: () => status.value === 'pending',
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
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiMergeTable v-else-if="data" :data="data" />
</template>
