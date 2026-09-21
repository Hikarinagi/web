<script setup lang="ts">
  import { Link, Stack } from '@hina-ui/vue'
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
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
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

    <Stack gap="lg" class="mx-auto w-full max-w-app px-6 py-10">
      <NuxtLink v-slot="{ href, navigate }" :to="`/mangas/${mangaId}`" custom>
        <Link
          :href="href ?? undefined"
          tone="neutral"
          :underline="false"
          class="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg"
          @click="navigate"
        >
          <ArrowLeft class="size-3.5" />
          返回《{{ mangaName }}》的详情页
        </Link>
      </NuxtLink>

      <RateListLayout>
        <template #aside>
          <MangaRatesStats
            :stats="data.statistics"
            :manga-id="mangaId"
            :work-title="mangaName"
            :my-rate="data.my_rate"
          />
        </template>

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
      </RateListLayout>
    </Stack>
  </Stack>
</template>
