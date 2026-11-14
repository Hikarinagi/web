<script setup lang="ts">
  import { Divider, Empty, Grid, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { monthText } from '~/features/galgame/calendar'
  import { dayLabel, weekdayLabel } from '~/features/landing/labels'

  type Calendar = GalgamesCalendarPageData['calendar']

  defineOptions({ name: 'GalgameCalendarPage' })
  const props = defineProps<{ calendar: Calendar; month: string; pending?: boolean }>()
  const emit = defineEmits<{ update: [month: string] }>()

  const days = computed(() => {
    const groups = new Map<string, Calendar['items']>()
    for (const item of props.calendar.items) {
      if (item.release_date_precision !== 'DAY' || !item.release_date) continue
      const date = item.release_date.slice(0, 10)
      groups.set(date, [...(groups.get(date) ?? []), item])
    }
    return [...groups].map(([date, items]) => ({ date, items }))
  })
  const vague = computed(() =>
    props.calendar.items.filter(item => item.release_date_precision !== 'DAY'),
  )
  const counts = computed(() => new Map(days.value.map(day => [day.date, day.items.length])))
  const upcoming = computed(() => {
    const { today, month } = props.calendar
    if (!today.startsWith(month) || counts.value.has(today)) return null
    return days.value.find(day => day.date > today)?.date ?? null
  })

  function pick(date: string) {
    document.getElementById(`day-${date}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
</script>

<template>
  <Stack gap="lg" class="mx-auto w-full max-w-(--entry-container) px-4 pt-6 pb-16 lg:px-6">
    <Inline gap="sm" align="baseline">
      <Heading :level="1" size="2xl">发售日历</Heading>
      <Text tone="muted" class="tabular-nums">{{ monthText(calendar.month) }}</Text>
      <Text v-if="calendar.items.length" tone="muted" class="tabular-nums">
        {{ calendar.items.length }} 部
      </Text>
    </Inline>
    <Grid gap="xl" class="lg:grid-cols-12">
      <Stack
        as="aside"
        gap="lg"
        class="min-w-0 lg:sticky lg:top-(--sticky-top) lg:order-last lg:col-span-4 lg:self-start xl:col-span-3"
      >
        <GalgameCalendarMonth
          :month="month"
          :today="calendar.today"
          :first-year="calendar.first_year"
          :last-year="calendar.last_year"
          :counts="counts"
          @update="emit('update', $event)"
          @pick="pick"
        />
        <GalgameCalendarYear
          :month="month"
          :months="calendar.months"
          class="max-lg:hidden"
          @update="emit('update', $event)"
        />
      </Stack>
      <Stack gap="md" class="relative min-w-0 lg:col-span-8 xl:col-span-9">
        <Empty v-if="!calendar.items.length" title="这个月没有发售的作品" />
        <template v-for="(day, index) in days" :key="day.date">
          <Divider v-if="day.date === upcoming">今天</Divider>
          <Divider v-else-if="index" />
          <GalgameCalendarDay
            :id="`day-${day.date}`"
            :title="String(Number(day.date.slice(8)))"
            :note="weekdayLabel(day.date)"
            :label="`${dayLabel(day.date)}${weekdayLabel(day.date)}`"
            :today="day.date === calendar.today"
            :items="day.items"
          />
        </template>
        <Divider v-if="vague.length && days.length" />
        <GalgameCalendarDay
          v-if="vague.length"
          title="月内"
          note="日期未定"
          :label="`${monthText(calendar.month)}，日期未定`"
          :items="vague"
        />
        <LoadingOverlay :visible="pending" />
      </Stack>
    </Grid>
  </Stack>
</template>
