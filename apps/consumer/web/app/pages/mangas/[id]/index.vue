<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { mangaSeo } from '~/features/seo/manga'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const mangaId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/mangas/${mangaId}`, {
    fatal: true,
  })
  useNsfwDetailGate(() => data.value?.manga.nsfw)
  useViewPing('manga', mangaId)

  const seo = computed(() => (data.value ? mangaSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '漫画',
    headerTitle: () => seo.value?.headerTitle ?? '漫画',
    description: () => seo.value?.description,
    card: { type: 'manga', id: mangaId },
    schemaOrg: seo.value?.schema,
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

    <Stack gap="none" class="mx-auto w-full max-w-app gap-10 px-6 py-12">
      <MangaChapters
        :manga-id="data.manga.id"
        :chapters="data.chapters"
        :volumes="data.volumes"
        :progress="data.progress"
        :latest-chapter-at="data.manga.latest_chapter_at"
      />

      <MangaRatesSummary
        :stats="data.rate_stats"
        :top-rates="data.top_rates"
        :manga="data.manga"
        :my-rate="data.my_rate"
      />

      <MangaAbout
        :manga="data.manga"
        :tags="data.tags"
        :people="data.people"
        :producers="data.producers"
        :volumes="data.volumes"
        :contributors="data.contributors"
      />

      <MangaCharacters :characters="data.characters" />
    </Stack>
  </Stack>
</template>
