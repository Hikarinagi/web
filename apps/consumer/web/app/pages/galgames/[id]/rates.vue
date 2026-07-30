<script setup lang="ts">
  import { ArrowLeft } from '@lucide/vue'
  import { useGalgameRates } from '~/features/galgame/useGalgameRates'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const galgameId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/galgames/${galgameId}/rates`, { fatal: true })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.galgame.nsfw)
  const { items, total, pending, hasMore, loadMore, sort, status, score, spoiler, hasDimensions } =
    useGalgameRates(galgameId, data.value!.rates)

  const galgameName = computed(() => {
    const g = data.value?.galgame
    return g?.trans_title || g?.origin_title || ''
  })

  useHikariSeoMeta({
    title: () => (galgameName.value ? [`${galgameName.value} · 全部评分`, '全部评分'] : '全部评分'),
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <GalgameHero
      :galgame="data.galgame"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :my-cover-vote="data.my_cover_vote"
      :favorited="data.favorite?.favorited ?? false"
    />

    <div class="mx-auto flex max-w-app flex-col gap-6 px-6 py-10">
      <NuxtLink
        :to="`/galgames/${galgameId}`"
        class="inline-flex w-fit items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
      >
        <ArrowLeft class="size-3.5" />
        返回《{{ galgameName }}》的详情页
      </NuxtLink>

      <GalgameRatesStats :stats="data.statistics" :keywords="data.keywords.keywords" />

      <GalgameRatesFilters
        v-model:sort="sort"
        v-model:status="status"
        v-model:score="score"
        v-model:spoiler="spoiler"
        v-model:has-dimensions="hasDimensions"
        :total="total"
      />

      <GalgameRatesList
        :items="items"
        :galgame-id="galgameId"
        :total="total"
        :has-more="hasMore"
        :pending="pending"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>
