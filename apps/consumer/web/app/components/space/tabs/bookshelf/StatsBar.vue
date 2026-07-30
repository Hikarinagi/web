<script setup lang="ts">
  import { readingTimeHours, type SpaceReadingStats } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsBookshelfStatsBar' })

  const props = defineProps<{ stats: SpaceReadingStats }>()

  const cells = computed(() => [
    { value: readingTimeHours(props.stats.total_read_time), unit: '小时', label: '总阅读时长' },
    { value: readingTimeHours(props.stats.week_read_time), unit: '小时', label: '本周时长' },
    { value: String(props.stats.streak_days), unit: '天', label: '连续阅读' },
    { value: String(props.stats.reading_count), unit: '', label: '在读卷数' },
    { value: String(props.stats.finished_count), unit: '', label: '读完卷数' },
  ])
</script>

<template>
  <SpaceTabsBookshelfStatsRow :cells="cells" />
</template>
