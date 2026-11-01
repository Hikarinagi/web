<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { galgameSeo } from '~/features/seo/galgame'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const galgameId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/galgames/${galgameId}`, { fatal: true })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.galgame.nsfw)
  useViewPing('galgame', galgameId)

  const seo = computed(() => (data.value ? galgameSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? 'Galgame',
    headerTitle: () => seo.value?.headerTitle ?? 'Galgame',
    description: () => seo.value?.description,
    card: { type: 'galgame', id: galgameId },
    schemaOrg: seo.value?.schema,
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

    <Stack gap="none" class="mx-auto w-full max-w-app gap-10 px-6 py-12">
      <GalgameRatesSummary
        :stats="data.rate_stats"
        :top-rates="data.top_rates"
        :galgame="data.galgame"
        :my-rate="data.my_rate"
      />

      <GalgameAbout
        :galgame="data.galgame"
        :tags="data.tags"
        :characters="data.characters"
        :producers="data.producers"
        :contributors="data.contributors"
      />

      <WorkLongReviews :articles="data.articles" />

      <GalgameImages :galgame="data.galgame" />

      <GalgameRelations :relations="data.relations" />

      <GalgameCrew :producers="data.producers" :staff="data.staff" />
    </Stack>
  </Stack>
</template>
