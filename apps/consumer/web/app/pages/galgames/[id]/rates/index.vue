<script setup lang="ts">
  import { Link, Stack } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { useGalgameRates } from '~/features/galgame/useGalgameRates'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const galgameId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/galgames/${galgameId}/rates`, { fatal: true })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.galgame.nsfw)
  const {
    items,
    total,
    pending,
    hasMore,
    filtered,
    loadMore,
    sort,
    status,
    score,
    spoiler,
    hasDimensions,
  } = useGalgameRates(galgameId, data.value!.rates)

  const galgameName = computed(() => {
    const g = data.value?.galgame
    return g?.trans_title || g?.origin_title || ''
  })

  useHikariSeoMeta({
    title: () => (galgameName.value ? [`${galgameName.value} · 全部评分`, '全部评分'] : '全部评分'),
  })
</script>

<template>
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
    <GalgameHero
      :galgame="data.galgame"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :my-cover-vote="data.my_cover_vote"
      :favorited="data.favorite?.favorited ?? false"
    />

    <Stack gap="lg" class="mx-auto w-full max-w-app px-6 py-10">
      <NuxtLink v-slot="{ href, navigate }" :to="`/galgames/${galgameId}`" custom>
        <Link
          :href="href ?? undefined"
          tone="neutral"
          :underline="false"
          class="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg"
          @click="navigate"
        >
          <ArrowLeft class="size-3.5" />
          返回《{{ galgameName }}》的详情页
        </Link>
      </NuxtLink>

      <RateListLayout>
        <template #aside>
          <GalgameRatesStats
            :stats="data.statistics"
            :keywords="data.keywords.keywords"
            :galgame-id="galgameId"
            :work-title="galgameName"
            :my-rate="data.my_rate"
          />
        </template>

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
          :filtered="filtered"
          :pending="pending"
          @load-more="loadMore"
        />
      </RateListLayout>
    </Stack>
  </Stack>
</template>
