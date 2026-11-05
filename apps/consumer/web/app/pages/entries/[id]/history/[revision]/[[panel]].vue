<script setup lang="ts">
  import { versionName } from '~/features/wiki/history'
  import type { VersionPageData } from '~~/server/api/pages/entries/[id]/history/[revision].get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    fill: true,
    title: '单个版本',
  })

  const route = useRoute()
  const request = computed(
    () =>
      `/api/pages/entries/${String(route.params.id)}/history/${String(route.params.revision)}` as `/api/pages/${string}`,
  )
  const { data, refresh } = await useHikariApiData<VersionPageData>(request, { fatal: true })
  useCreatorPage({
    title: () =>
      data.value
        ? `${data.value.entry.label || '未命名'}：${versionName(data.value.version.created_at)}`
        : undefined,
    crumbs: () =>
      data.value
        ? [
            {
              label: data.value.entry.label || '未命名',
              to: `/entries/${data.value.entry.id}/edit`,
            },
            { label: '修改记录', to: `/entries/${data.value.entry.id}/history` },
            { label: versionName(data.value.version.created_at) },
          ]
        : undefined,
  })
</script>

<template>
  <WikiHistoryVersion v-if="data" :data="data" @changed="refresh()" />
</template>
