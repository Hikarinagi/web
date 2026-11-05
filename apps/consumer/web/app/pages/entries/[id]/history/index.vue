<script setup lang="ts">
  import type { HistoryPageData } from '~~/server/api/pages/entries/[id]/history.get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '修改记录',
  })

  const route = useRoute()
  const request = computed(() => {
    const page = Number(route.query.page) > 1 ? `?page=${String(route.query.page)}` : ''
    return `/api/pages/entries/${String(route.params.id)}/history${page}` as `/api/pages/${string}`
  })
  const { data, pending } = await useHikariApiData<HistoryPageData>(request, { fatal: true })
  useCreatorPage({
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
  <WikiHistoryList v-if="data" :data="data" :loading="pending" />
</template>
