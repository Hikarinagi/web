<script setup lang="ts">
  import type { ComparePageData } from '~~/server/api/pages/entries/[id]/history/compare.get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '两个版本的对照',
    fill: true,
  })

  const route = useRoute()
  const request = computed(() => {
    const query = new URLSearchParams({
      from: String(route.query.from ?? ''),
      to: String(route.query.to ?? ''),
    })
    return `/api/pages/entries/${String(route.params.id)}/history/compare?${query.toString()}` as `/api/pages/${string}`
  })
  const { data, error, status, refresh } = useHikariApiData<ComparePageData>(request)
  useCreatorPage({
    loading: () => status.value === 'pending',
    title: () => (data.value ? `${data.value.entry.label || '未命名'}：两个版本的对照` : undefined),
    crumbs: () =>
      data.value
        ? [
            {
              label: data.value.entry.label || '未命名',
              to: `/entries/${data.value.entry.id}/edit`,
            },
            { label: '修改记录', to: `/entries/${data.value.entry.id}/history` },
            { label: '两个版本的对照' },
          ]
        : undefined,
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiHistoryCompare v-else-if="data" :data="data" />
</template>
