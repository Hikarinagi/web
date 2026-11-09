<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { useGalgameRates } from '~/features/galgame/useGalgameRates'

  definePageMeta({ container: 'full' })

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
    <GalgameBand :galgame="data.galgame" :title="galgameName" heading="全部评分" />

    <Stack gap="lg" class="mx-auto w-full max-w-(--entry-container) px-4 py-8 lg:px-6">
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
