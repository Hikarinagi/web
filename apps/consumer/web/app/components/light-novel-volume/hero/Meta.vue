<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
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
