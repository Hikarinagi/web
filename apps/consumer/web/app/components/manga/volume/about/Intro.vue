<script setup lang="ts">
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeAboutIntro' })
  const props = defineProps<{ volume: MangaVolumePageData['volume'] }>()

  const primary = computed(() => props.volume.summary_cn || props.volume.summary)
  const jp = computed(() =>
    props.volume.summary_cn &&
    props.volume.summary &&
    props.volume.summary !== props.volume.summary_cn
      ? props.volume.summary
      : '',
  )
</script>

<template>
  <WorkIntro :text="primary" :original="jp" empty-text="这一卷还没有简介" size="sm" />
</template>
