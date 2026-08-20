<script setup lang="ts">
  import type { GalgameHistogram } from '~/features/galgame/explore'
  import type { TimelineRangeUpdate } from '~/features/galgame/useReleaseTimeline'

  defineOptions({ name: 'GalgameBrowseTimeline' })
  const props = defineProps<{
    histogram: GalgameHistogram
    startFrom?: string
    startTo?: string
    startPeriods: string[]
    endFrom?: string
    endTo?: string
    endPeriods: string[]
  }>()
  const emit = defineEmits<{
    update: [
      value: {
        start_from?: string
        start_to?: string
        start_periods?: string[]
        end_from?: string
        end_to?: string
        end_periods?: string[]
      },
    ]
  }>()

  function updateStart(value: TimelineRangeUpdate) {
    emit('update', {
      start_from: value.from,
      start_to: value.to,
      start_periods: value.periods,
    })
  }

  function updateEnd(value: TimelineRangeUpdate) {
    emit('update', {
      end_from: value.from,
      end_to: value.to,
      end_periods: value.periods,
    })
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <GalgameBrowseTimelinePanel
      title="开始时间"
      :histogram="props.histogram"
      :from="props.startFrom"
      :to="props.startTo"
      :periods="props.startPeriods"
      @update="updateStart"
    />
    <GalgameBrowseTimelinePanel
      title="完结时间"
      :histogram="props.histogram"
      :from="props.endFrom"
      :to="props.endTo"
      :periods="props.endPeriods"
      @update="updateEnd"
    />
  </div>
</template>
