<script setup lang="ts">
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
  <div v-if="data" class="-mt-(--app-header-height)">
    <GalgameHero
      :galgame="data.galgame"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :my-cover-vote="data.my_cover_vote"
      :favorited="data.favorite?.favorited ?? false"
    />

    <div class="mx-auto flex max-w-app flex-col gap-10 px-6 py-12">
      <GalgameRatesSummary
        :stats="data.rate_stats"
        :top-rates="data.top_rates"
        :galgame-id="data.galgame.id"
      />

      <GalgameAbout
        :galgame="data.galgame"
        :tags="data.tags"
        :producers="data.producers"
        :contributors="data.contributors"
      />

      <GalgameCharactersSection :characters="data.characters" />

      <GalgameLongReviews :articles="data.articles" />

      <GalgameMentions :posts="data.posts" />

      <GalgameImages :galgame="data.galgame" />

      <GalgameDerivativesSection
        :galgame-id="data.galgame.id"
        :relations="data.relations"
        :merchs="data.merchs"
        :links="data.links"
      />

      <GalgameCrew :producers="data.producers" :staff="data.staff" />
    </div>
  </div>
</template>
