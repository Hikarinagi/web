<script setup lang="ts">
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeHeroMeta' })
  const props = defineProps<{ volume: MangaVolumePageData['volume'] }>()

  const parts = computed(() =>
    [
      props.volume.volume_number != null ? `第 ${props.volume.volume_number} 卷` : '',
      timeFormat(props.volume.publication_date, TimeFormatEnum.YYYY_M_DD_CN),
      props.volume.page_count ? `${props.volume.page_count} 页` : '',
      props.volume.price_amount != null
        ? [props.volume.price_currency, props.volume.price_amount].filter(Boolean).join(' ')
        : '',
    ].filter(Boolean),
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
