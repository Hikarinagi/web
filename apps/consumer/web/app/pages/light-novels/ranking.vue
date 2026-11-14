<script setup lang="ts">
  import type { LightNovelsRankingPageData } from '~~/server/api/pages/light-novels/ranking.get'
  import {
    rankingBff,
    rankingRoute,
    readRankingQuery,
    type RankingPeriod,
  } from '~/features/ranking/ranking'

  defineOptions({ name: 'LightNovelsRankingPage' })
  definePageMeta({ container: 'full', scrollToTop: true })

  const route = useRoute()
  const router = useRouter()
  const request = computed(() => rankingBff('light-novels', readRankingQuery(route.query)))
  const { data, pending } = await useHikariApiData<LightNovelsRankingPageData>(request, {
    fatal: true,
    watch: [request],
  })

  function update(period: RankingPeriod) {
    void router.push(rankingRoute('light-novels', period))
  }

  useHikariSeoMeta({
    title: '轻小说排行榜',
    headerTitle: '轻小说',
    description: '轻小说日榜、周榜与月榜，看看大家最近都在读什么！',
  })
</script>

<template>
  <LightNovelRankingPage v-if="data" :ranking="data.ranking" :pending="pending" @update="update" />
</template>
