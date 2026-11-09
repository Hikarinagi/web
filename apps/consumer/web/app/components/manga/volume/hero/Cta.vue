<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { BookOpen } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { chaptersInVolume, wholeVolumeOf } from '~/features/manga/volumes'

  defineOptions({ name: 'MangaVolumeHeroCta' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    volumes: MangaVolumePageData['volumes']
    chapters: MangaVolumePageData['chapters']
    progress: MangaVolumePageData['progress']
  }>()

  const whole = computed(() => wholeVolumeOf(props.chapters, props.volume, props.volumes))
  const scoped = computed(() => chaptersInVolume(props.chapters, props.volume, props.volumes))
  const downloadable = computed(() =>
    [...(whole.value ? [whole.value] : []), ...scoped.value].filter(chapter => chapter.readable),
  )
  const start = computed(() => {
    if (whole.value?.readable) return whole.value
    return scoped.value.find(chapter => chapter.readable) ?? null
  })
  const continuing = computed(
    () =>
      !!start.value &&
      !!props.progress &&
      (props.progress.chapter.id === start.value.id ||
        scoped.value.some(chapter => chapter.id === props.progress!.chapter.id)),
  )
  const readPath = computed(() => {
    if (!start.value) return null
    const chapterId = continuing.value ? props.progress!.chapter.id : start.value.id
    return `/mangas/${props.volume.series_id}/read/${chapterId}`
  })
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = computed(() => (props.volume.publication_date?.slice(0, 10) ?? '') > today)
</script>

<template>
  <Inline gap="sm" align="center">
    <Button v-if="readPath" :as="NuxtLink" :to="readPath" class="w-full sm:w-auto">
      <template #icon><BookOpen /></template>
      {{ continuing ? '继续阅读' : '阅读本卷' }}
    </Button>
    <Button v-else-if="upcoming" disabled class="w-full sm:w-auto">
      <template #icon><BookOpen /></template>
      尚未发售
    </Button>
    <MangaVolumeContribute v-else :volume="volume" class="w-full sm:w-auto" />
    <MangaDownloadAction
      :id="volume.series_id"
      :title="volume.manga.name_cn || volume.manga.name"
      :chapters="downloadable"
      size="md"
      variant="soft"
      tone="neutral"
    />
    <ShareButton
      :to="`/manga-volumes/${volume.id}`"
      tooltip="分享"
      size="md"
      variant="soft"
      tone="neutral"
    />
  </Inline>
</template>
