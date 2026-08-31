<script setup lang="ts">
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { getLightNovelVolumeLabel } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelVolumeHeroMeta' })
  const props = defineProps<{ volume: LightNovelVolumePageData['volume'] }>()

  const volumeLabel = computed(() => getLightNovelVolumeLabel(props.volume))
  const parts = computed(() =>
    [
      volumeLabel.value,
      timeFormat(props.volume.publication_date, TimeFormatEnum.YYYY_M_DD_CN),
      props.volume.pages ? `${props.volume.pages} 页` : '',
      props.volume.price_amount != null
        ? [props.volume.price_currency, props.volume.price_amount].filter(Boolean).join(' ')
        : '',
    ].filter((part): part is string => Boolean(part)),
  )
</script>

<template>
  <p
    v-if="parts.length"
    class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-surface-600 lg:justify-start dark:text-surface-300"
  >
    <template v-for="(part, i) in parts" :key="part">
      <span v-if="i > 0" class="text-surface-300 dark:text-surface-600">·</span>
      <span>{{ part }}</span>
    </template>
  </p>
</template>
