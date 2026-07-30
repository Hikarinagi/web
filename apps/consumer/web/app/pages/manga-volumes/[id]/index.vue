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
  <div v-if="data" class="-mt-(--app-header-height)">
    <MangaVolumeHero :volume="data.volume" />

    <div class="mx-auto flex max-w-app flex-col gap-10 px-6 py-12">
      <MangaVolumeAbout :volume="data.volume" :contributors="data.contributors" />

      <MangaChapters
        :manga-id="data.volume.manga.id"
        :chapters="data.chapters"
        :progress="data.progress"
        :volume-number="data.volume.volume_number"
        :show-volumes="false"
      />

      <MangaVolumeSeriesStrip :volume="data.volume" :volumes="data.volumes" />
    </div>
  </div>
</template>
