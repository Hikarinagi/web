<script setup lang="ts">
  import type { MergePickPageData } from '~~/server/api/pages/entries/[id]/merge.get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '合并',
    fill: true,
  })

  const route = useRoute()
  const { data, error, status, refresh } = useHikariApiData<MergePickPageData>(
    `/api/pages/entries/${String(route.params.id)}/merge`,
  )
  useCreatorPage({
    loading: () => status.value === 'pending',
    title: () => (data.value ? `合并到「${data.value.entry.label || '未命名'}」` : undefined),
    crumbs: () =>
      data.value
        ? [
            {
              label: data.value.entry.label || '未命名',
              to: `/entries/${data.value.entry.id}/edit`,
            },
            { label: '合并' },
          ]
        : undefined,
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiMergePick v-else-if="data" :data="data" />
</template>
