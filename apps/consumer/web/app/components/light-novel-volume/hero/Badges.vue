<script setup lang="ts">
  import { getVolumeTypeLabel } from '#imports'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeHeroBadges' })
  defineProps<{ volume: LightNovelVolumePageData['volume'] }>()
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2 lg:justify-start">
    <Tag
      :value="getVolumeTypeLabel(volume.volume_type)"
      severity="secondary"
      class="px-2.5! py-1! text-xs! font-medium!"
    />
    <Tag
      v-if="volume.online_reading_available"
      value="EPUB"
      severity="success"
      class="px-2.5! py-1! text-xs! font-medium!"
    />
    <Tag
      v-if="volume.online_reading_available && volume.online_reading_is_collection"
      value="合集"
      severity="warn"
      class="px-2.5! py-1! text-xs! font-medium!"
    />
  </div>
</template>
