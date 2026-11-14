<script setup lang="ts">
  import type { GalgameSnapshotPageData } from '~~/server/api/pages/galgames/[id]/revisions/[revision].get'

  definePageMeta({
    container: 'full',
    footer: false,
  })

  const route = useRoute()
  const galgameId = Number(route.params.id)
  const revision = Number(route.params.revision)

  const { data } = await useHikariApiData<GalgameSnapshotPageData>(
    `/api/pages/galgames/${galgameId}/revisions/${revision}`,
    { fatal: true },
  )
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.display.title, '修订快照'] : '修订快照'),
  })
</script>

<template>
  <GalgameHistorySnapshot v-if="data" :galgame-id="galgameId" :data="data" />
</template>
