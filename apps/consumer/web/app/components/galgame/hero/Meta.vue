<script setup lang="ts">
  import { Building2, CalendarDays } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    producers: GalgamePageData['producers']
  }>()

  const releaseText = computed(() => {
    if (props.galgame.start_date_tbd) return props.galgame.start_date_tbd_note || '发售日待定'
    if (!props.galgame.start_date) return '发售日未定'
    if (props.galgame.start_date_year_only) {
      // date 字段按日历日处理,取 ISO 前 4 位年份,避免负时区偏移一年
      const year = Number(props.galgame.start_date.slice(0, 4))
      return Number.isFinite(year) && year > 0 ? `${year}年` : '发售日未定'
    }

    return datePartFormat(props.galgame.start_date, TimeFormatEnum.YYYY_M_DD_CN)
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
  <div
    class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-surface-600 lg:justify-start dark:text-surface-300"
  >
    <span class="inline-flex items-center gap-2">
      <CalendarDays :size="17" class="shrink-0" aria-hidden="true" />
      {{ releaseText }}
    </span>
    <span v-if="producerNames" class="inline-flex items-center gap-2">
      <Building2 :size="17" class="shrink-0" aria-hidden="true" />
      {{ producerNames }}
    </span>
  </div>
</template>
