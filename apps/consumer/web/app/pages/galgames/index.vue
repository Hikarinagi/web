<script setup lang="ts">
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
  <div v-if="data" class="-mt-(--app-header-height)">
    <GalgameExploreHero :mosaic="data.mosaic" :total="data.total_items" />

    <div class="mx-auto box-content flex max-w-app flex-col gap-14 px-6 py-12">
      <GalgameExploreReleaseRow :release="data.release" />
      <GalgameExploreReleaseRow
        title="上月发售"
        :release="data.last_month"
        :to="data.last_month.browse_to"
      />
      <GalgameExploreBrowseEntry />
      <GalgameExploreRecommendStream />
    </div>
  </div>
</template>
