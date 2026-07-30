<script setup lang="ts">
  import { lightNovelVolumeSeo } from '~/features/seo/light-novel-volume'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const volumeId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/light-novel-volumes/${volumeId}`, {
    fatal: true,
  })
  useNsfwDetailGate(() => data.value?.light_novel.nsfw)
  useViewPing('light_novel_volume', volumeId)

  const currentIndex = computed(() => {
    if (!data.value) return -1
    return data.value.volumes.findIndex(volume => volume.id === data.value?.volume.id)
  })
  const previousVolume = computed(() =>
    currentIndex.value > 0 ? data.value?.volumes[currentIndex.value - 1] : undefined,
  )
  const nextVolume = computed(() =>
    data.value && currentIndex.value >= 0 && currentIndex.value < data.value.volumes.length - 1
      ? data.value.volumes[currentIndex.value + 1]
      : undefined,
  )

  const seo = computed(() => (data.value ? lightNovelVolumeSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '轻小说分卷',
    headerTitle: () => seo.value?.headerTitle ?? '轻小说分卷',
    description: () => seo.value?.description,
    card: { type: 'light-novel-volume', id: volumeId },
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <LightNovelVolumeHero
      :volume="data.volume"
      :light-novel="data.light_novel"
      :progress="data.progress"
      :my-rate="data.my_rate"
      :my-cover-vote="data.my_cover_vote"
    />

    <div class="mx-auto flex max-w-app flex-col gap-10 px-6 py-12">
      <LightNovelVolumeSeriesNav :previous="previousVolume" :next="nextVolume" />

      <LightNovelVolumeAbout :volume="data.volume" :contributors="data.contributors" />

      <LightNovelVolumeSeriesVolumes :volume="data.volume" :volumes="data.volumes" />
    </div>
  </div>
</template>
