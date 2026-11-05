<script setup lang="ts">
  import type { HistoryPageData } from '~~/server/api/pages/entries/[id]/history.get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '修改记录',
    fill: true,
  })

  const route = useRoute()
  const request = computed(() => {
    const page = Number(route.query.page) > 1 ? `?page=${String(route.query.page)}` : ''
    return `/api/pages/entries/${String(route.params.id)}/history${page}` as `/api/pages/${string}`
  })
  const { data, error, pending, refresh } = useHikariApiData<HistoryPageData>(request)
  useRefreshOnSaved(refresh)
  useCreatorPage({
    loading: () => pending.value && !data.value,
    title: () => (data.value ? `${data.value.entry.label || '未命名'}的修改记录` : undefined),
    crumbs: () =>
      data.value
        ? [
            {
              label: data.value.entry.label || '未命名',
              to: `/entries/${data.value.entry.id}/edit`,
            },
            { label: '修改记录' },
          ]
        : undefined,
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiHistoryList v-else-if="data" :data="data" :loading="pending" />
</template>
