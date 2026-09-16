<script setup lang="ts">
  import { ArrowLeft } from '@lucide/vue'
  import { useMangaRates } from '~/features/manga/useMangaRates'
  import { getMangaTitle } from '~/utils/media/manga'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const mangaId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/mangas/${mangaId}/rates`, { fatal: true })
  useNsfwDetailGate(() => data.value?.manga.nsfw)
  const { items, total, pending, hasMore, filtered, loadMore, sort, status, score, spoiler } =
    useMangaRates(mangaId, data.value!.rates)

  const mangaName = computed(() => (data.value ? getMangaTitle(data.value.manga) : ''))

  useHikariSeoMeta({
    title: () => (mangaName.value ? [`${mangaName.value} · 全部评分`, '全部评分'] : '全部评分'),
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <MangaHero
      :manga="data.manga"
      :chapters="data.chapters"
      :volumes="data.volumes"
      :people="data.people"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :progress="data.progress"
      :favorited="data.favorite?.favorited ?? false"
    />

    <div class="mx-auto flex max-w-app flex-col gap-6 px-6 py-10">
      <NuxtLink
        :to="`/mangas/${mangaId}`"
        class="inline-flex w-fit items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
      >
        <ArrowLeft class="size-3.5" />
        返回《{{ mangaName }}》的详情页
      </NuxtLink>

      <MangaRatesStats :stats="data.statistics" />

      <MangaRatesFilters
        v-model:sort="sort"
        v-model:status="status"
        v-model:score="score"
        v-model:spoiler="spoiler"
        :total="total"
      />

      <MangaRatesList
        :items="items"
        :manga-id="mangaId"
        :total="total"
        :has-more="hasMore"
        :filtered="filtered"
        :pending="pending"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>
