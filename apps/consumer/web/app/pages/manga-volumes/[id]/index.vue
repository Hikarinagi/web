<script setup lang="ts">
  import { mangaVolumeSeo } from '~/features/seo/manga-volume'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const volumeId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/manga-volumes/${volumeId}`, {
    fatal: true,
  })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.volume.manga.nsfw)
  useViewPing('manga_volume', volumeId)

  const seo = computed(() => (data.value ? mangaVolumeSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '漫画单行本',
    headerTitle: () => seo.value?.headerTitle ?? '漫画单行本',
    description: () => seo.value?.description,
    card: { type: 'manga-volume', id: volumeId },
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <MangaVolumePage
    v-if="data"
    :data="data"
    :volume-id="volumeId"
    class="-mt-(--app-header-height)"
  />
</template>
