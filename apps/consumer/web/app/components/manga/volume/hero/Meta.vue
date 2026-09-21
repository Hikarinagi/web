<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
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
  <Inline
    v-if="parts.length"
    gap="none"
    align="center"
    wrap
    class="justify-center gap-x-2 gap-y-1 lg:justify-start"
  >
    <template v-for="(part, i) in parts" :key="part">
      <Text v-if="i > 0" as="span" size="sm" tone="faint">·</Text>
      <Text as="span" size="sm" tone="muted">{{ part }}</Text>
    </template>
  </Inline>
</template>
