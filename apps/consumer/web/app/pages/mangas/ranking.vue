<script setup lang="ts">
  import type { MangasRankingPageData } from '~~/server/api/pages/mangas/ranking.get'
  import {
    rankingBff,
    rankingRoute,
    readRankingQuery,
    type RankingPeriod,
  } from '~/features/ranking/ranking'

  defineOptions({ name: 'MangasRankingPage' })
  definePageMeta({ container: 'full', scrollToTop: true })

  const route = useRoute()
  const router = useRouter()
  const request = computed(() => rankingBff('mangas', readRankingQuery(route.query)))
  const { data, pending } = await useHikariApiData<MangasRankingPageData>(request, {
    fatal: true,
    watch: [request],
  })

  function update(period: RankingPeriod) {
    void router.push(rankingRoute('mangas', period))
  }

  useHikariSeoMeta({
    title: '漫画排行榜',
    headerTitle: '漫画',
    description: '漫画日榜、周榜与月榜，看看大家最近都在读什么！',
  })
</script>

<template>
  <MangaRankingPage v-if="data" :ranking="data.ranking" :pending="pending" @update="update" />
</template>
