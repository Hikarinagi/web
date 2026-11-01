<script setup lang="ts">
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { getRevisionFieldPath } from '~/features/revision/resources'

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
  <WorkIntro
    :text="primary"
    :original="jp"
    :edit-to="getRevisionFieldPath('manga-volume', volume.id, 'summary_cn')"
    size="sm"
  />
</template>
