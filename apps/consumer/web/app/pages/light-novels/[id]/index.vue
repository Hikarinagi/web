<script setup lang="ts">
  import { lightNovelSeo } from '~/features/seo/light-novel'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const lightNovelId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/light-novels/${lightNovelId}`, {
    fatal: true,
  })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.light_novel.nsfw)
  useViewPing('light_novel', lightNovelId)

  const seo = computed(() => (data.value ? lightNovelSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '轻小说',
    headerTitle: () => seo.value?.headerTitle ?? '轻小说',
    description: () => seo.value?.description,
    card: { type: 'light-novel', id: lightNovelId },
    schemaOrg: seo.value?.schema,
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

    <div class="mx-auto flex max-w-app flex-col gap-10 px-6 py-12">
      <LightNovelVolumes :volumes="data.volumes" :progress="data.progress" />

      <LightNovelRatesSummary
        :stats="data.rate_stats"
        :top-rates="data.top_rates"
        :light-novel-id="data.light_novel.id"
      />

      <LightNovelAbout
        :light-novel="data.light_novel"
        :tags="data.tags"
        :characters="data.characters"
        :people="data.people"
        :producers="data.producers"
        :contributors="data.contributors"
      />

      <LightNovelLongReviews :articles="data.articles" />

      <LightNovelMentions :posts="data.posts" />

      <LightNovelRelations :relations="data.relations" />
    </div>
  </div>
</template>
