<script setup lang="ts">
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeSeriesVolumes' })
  defineProps<{
    volume: LightNovelVolumePageData['volume']
    volumes: LightNovelVolumePageData['volumes']
  }>()
</script>

<template>
  <LightNovelSection v-if="volumes.length" title="本系列" :meta="`${volumes.length} 卷`">
    <div class="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      <LightNovelVolumeItem
        v-for="item in volumes"
        :key="item.id"
        :volume="item"
        :active="item.id === volume.id"
      />
    </div>
  </LightNovelSection>
</template>
