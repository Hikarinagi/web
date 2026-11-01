<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { Building2, CalendarDays } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    producers: GalgamePageData['producers']
  }>()

  const releaseText = computed(() => {
    if (props.galgame.release_date_tbd) return props.galgame.release_date_tbd_note || '发售日未定'
    if (!props.galgame.release_date) return '发售日未定'

    return timeFormat(props.galgame.release_date, TimeFormatEnum.YYYY_M_DD_CN)
  })
  const producerNames = computed(() =>
    Array.from(
      new Set(
        props.producers
          .filter(item => item.role === 'DEVELOPER' || item.role === 'PUBLISHER')
          .map(item => item.producer.name)
          .filter(Boolean),
      ),
    ).join(' / '),
  )
</script>

<template>
  <Inline gap="none" align="center" wrap class="justify-center gap-x-6 gap-y-3 lg:justify-start">
    <Text as="span" size="sm" tone="muted" class="inline-flex items-center gap-2">
      <CalendarDays :size="17" class="shrink-0" aria-hidden="true" />
      {{ releaseText }}
    </Text>
    <Text
      v-if="producerNames"
      as="span"
      size="sm"
      tone="muted"
      class="inline-flex items-center gap-2"
    >
      <Building2 :size="17" class="shrink-0" aria-hidden="true" />
      {{ producerNames }}
    </Text>
  </Inline>
</template>
