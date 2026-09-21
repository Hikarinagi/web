<script setup lang="ts">
  import { Inline, Tag } from '@hina-ui/vue'
  import { getVolumeTypeLabel } from '#imports'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeHeroBadges' })
  defineProps<{ volume: LightNovelVolumePageData['volume'] }>()
</script>

<template>
  <Inline gap="sm" justify="center" wrap class="lg:justify-start">
    <Tag tone="neutral">{{ getVolumeTypeLabel(volume.volume_type) }}</Tag>
    <Tag v-if="volume.online_reading_available" tone="success">EPUB</Tag>
    <Tag
      v-if="volume.online_reading_available && volume.online_reading_is_collection"
      tone="warning"
    >
      合集
    </Tag>
  </Inline>
</template>
