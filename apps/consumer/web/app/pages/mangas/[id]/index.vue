<script setup lang="ts">
  import { mangaSeo } from '~/features/seo/manga'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
    footer: false,
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const mangaId = Number(rawId)

  const { data, refresh } = await useHikariApiData(`/api/pages/mangas/${mangaId}`, {
    fatal: true,
  })
  await redirectIfMerged(data)
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
  <MangaPage
    v-if="data"
    :data="data"
    :manga-id="mangaId"
    class="-mt-(--app-header-height)"
    @refresh="refresh"
  />
</template>
