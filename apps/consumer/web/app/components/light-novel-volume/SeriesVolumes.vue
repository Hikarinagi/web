<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeSeriesVolumes' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    volumes: LightNovelVolumePageData['volumes']
    progresses: LightNovelVolumePageData['progresses']
  }>()

  const progressMap = computed(
    () => new Map((props.progresses ?? []).map(item => [item.volume_id, item])),
  )
</script>

<template>
  <WorkSection v-if="volumes.length" title="本系列" :meta="`${volumes.length} 卷`">
    <Grid :cols="3" gap="none" class="gap-x-4 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      <LightNovelVolumeItem
        v-for="item in volumes"
        :key="item.id"
        :volume="item"
        :progress="progressMap.get(item.id) ?? null"
        :tracked="progresses != null"
        :active="item.id === volume.id"
      />
    </Grid>
  </WorkSection>
</template>
