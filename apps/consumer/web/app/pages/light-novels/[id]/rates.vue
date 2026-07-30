<script setup lang="ts">
  import { ArrowLeft } from '@lucide/vue'
  import { getLightNovelTitle } from '~/utils/media/light-novel'
  import { useLightNovelRates } from '~/features/light-novel/useLightNovelRates'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const lightNovelId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/light-novels/${lightNovelId}/rates`, {
    fatal: true,
  })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.light_novel.nsfw)
  const { items, total, pending, hasMore, loadMore, sort, status, score, spoiler, hasDimensions } =
    useLightNovelRates(lightNovelId, data.value!.rates)

  const lightNovelName = computed(() => {
    const ln = data.value?.light_novel
    return ln ? getLightNovelTitle(ln) : ''
  })

  useHikariSeoMeta({
    title: () =>
      lightNovelName.value ? [`${lightNovelName.value} · 全部评分`, '全部评分'] : '全部评分',
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <LightNovelHero
      :light-novel="data.light_novel"
      :volumes="data.volumes"
      :people="data.people"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :my-cover-vote="data.my_cover_vote"
      :favorited="data.favorite?.favorited ?? false"
      :progress="data.progress"
    />

    <div class="mx-auto flex max-w-app flex-col gap-6 px-6 py-10">
      <NuxtLink
        :to="`/light-novels/${lightNovelId}`"
        class="inline-flex w-fit items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
      >
        <ArrowLeft class="size-3.5" />
        返回《{{ lightNovelName }}》的详情页
      </NuxtLink>

      <LightNovelRatesStats :stats="data.statistics" :keywords="data.keywords.keywords" />

      <LightNovelRatesFilters
        v-model:sort="sort"
        v-model:status="status"
        v-model:score="score"
        v-model:spoiler="spoiler"
        v-model:has-dimensions="hasDimensions"
        :total="total"
      />

      <LightNovelRatesList
        :items="items"
        :light-novel-id="lightNovelId"
        :total="total"
        :has-more="hasMore"
        :pending="pending"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>
