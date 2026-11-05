<script setup lang="ts">
  import type { ComparePageData } from '~~/server/api/pages/entries/[id]/history/compare.get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '两个版本的对照',
  })

  const route = useRoute()
  const request = computed(() => {
    const query = new URLSearchParams({
      from: String(route.query.from ?? ''),
      to: String(route.query.to ?? ''),
    })
    return `/api/pages/entries/${String(route.params.id)}/history/compare?${query.toString()}` as `/api/pages/${string}`
  })
  const { data } = await useHikariApiData<ComparePageData>(request, { fatal: true })
  useCreatorPage({
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
  <WikiHistoryCompare v-if="data" :data="data" />
</template>
