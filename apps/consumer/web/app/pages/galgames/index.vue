<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'

  defineOptions({ name: 'GalgamesPage' })
  definePageMeta({ container: 'full' })

  const { data } = await useHikariApiData('/api/pages/galgames', { fatal: true })

  useHikariSeoMeta({
    title: 'Galgame・视觉小说图鉴',
    description: () =>
      '浏览超全的 Galgame・视觉小说数据库，收录作品介绍、发售信息、角色 CV、Staff，以及大家的评价。记录你的游玩状态，写下你的犀利吐槽吧！',
  })
</script>

<template>
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
    <GalgameExploreHero :mosaic="data.mosaic" />

    <Stack gap="none" class="px-6 py-12">
      <Stack gap="none" class="mx-auto w-full max-w-app gap-14">
        <GalgameExploreReleaseRow :release="data.release" />
        <GalgameExploreReleaseRow
          title="上月发售"
          :release="data.last_month"
          :to="data.last_month.browse_to"
        />
        <GalgameExploreBrowseEntry />
        <GalgameExploreRecommendStream />
      </Stack>
    </Stack>
  </Stack>
</template>
