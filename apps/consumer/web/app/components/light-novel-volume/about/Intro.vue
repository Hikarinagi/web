<script setup lang="ts">
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeAboutIntro' })
  const props = defineProps<{ volume: LightNovelVolumePageData['volume'] }>()

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
  <WorkIntro :text="primary" :original="jp" />
</template>
