<script setup lang="ts">
  import { Link, Stack } from '@hina-ui/vue'
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
  } = useLightNovelRates(lightNovelId, data.value!.rates)

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
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
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

    <Stack gap="lg" class="mx-auto w-full max-w-app px-6 py-10">
      <NuxtLink v-slot="{ href, navigate }" :to="`/light-novels/${lightNovelId}`" custom>
        <Link
          :href="href ?? undefined"
          tone="neutral"
          :underline="false"
          class="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg"
          @click="navigate"
        >
          <ArrowLeft class="size-3.5" />
          返回《{{ lightNovelName }}》的详情页
        </Link>
      </NuxtLink>

      <RateListLayout>
        <template #aside>
          <LightNovelRatesStats
            :stats="data.statistics"
            :keywords="data.keywords.keywords"
            :light-novel-id="lightNovelId"
            :work-title="lightNovelName"
            :my-rate="data.my_rate"
          />
        </template>

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
          :filtered="filtered"
          :pending="pending"
          @load-more="loadMore"
        />
      </RateListLayout>
    </Stack>
  </Stack>
</template>
