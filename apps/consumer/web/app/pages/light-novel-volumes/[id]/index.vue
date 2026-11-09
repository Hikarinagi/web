<script setup lang="ts">
  import { lightNovelVolumeSeo } from '~/features/seo/light-novel-volume'
  import { useViewPing } from '~/features/interaction/useViewPing'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const volumeId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/light-novel-volumes/${volumeId}`, {
    fatal: true,
  })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.light_novel.nsfw)
  useViewPing('light_novel_volume', volumeId)

  function applyProgresses(progresses: NonNullable<LightNovelVolumePageData['progresses']>) {
    if (!data.value) return
    data.value = {
      ...data.value,
      progresses,
      progress: progresses.find(entry => entry.volume_id === data.value?.volume.id) ?? null,
    }
  }

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
  <LightNovelVolumePage
    v-if="data"
    :data="data"
    :volume-id="volumeId"
    class="-mt-(--app-header-height)"
    @progress-change="applyProgresses"
  />
</template>
