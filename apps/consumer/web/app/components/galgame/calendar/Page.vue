<script setup lang="ts">
  import {
    Button,
    Empty,
    Grid,
    Heading,
    IconButton,
    Inline,
    SegmentedControl,
    Select,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { shiftMonth } from '~/features/galgame/calendar'
  import { daysBetween, weekdayLabel } from '~/features/landing/labels'

  type Calendar = GalgamesCalendarPageData['calendar']

  defineOptions({ name: 'GalgameCalendarPage' })
  const props = defineProps<{ calendar: Calendar; month: string; pending?: boolean }>()
  const emit = defineEmits<{ update: [month: string] }>()

  const year = computed(() => Number(props.month.slice(0, 4)))
  const years = computed(() =>
    Array.from(
      { length: props.calendar.last_year - props.calendar.first_year + 1 },
      (_, index) => props.calendar.last_year - index,
    ).map(value => ({ value, label: `${value} 年` })),
  )
  const months = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label: `${index + 1} 月`,
  }))
  const current = computed(() => props.calendar.today.slice(0, 7))
  const tiles = computed(() => {
    let last = ''
    return props.calendar.items.map(item => {
      const exact = item.release_date_precision === 'DAY' && !!item.release_date
      const date = exact ? item.release_date!.slice(0, 10) : 'vague'
      const first = date !== last
      last = date
      const left = exact ? daysBetween(props.calendar.today, date) : -1
      return {
        item,
        label: !first
          ? ''
          : exact
            ? `${Number(date.slice(8))} 日 ${weekdayLabel(date)}`
            : '日期未定',
        badge: !first || left < 0 ? '' : left === 0 ? '今天' : `还有 ${left} 天`,
        today: left === 0,
        upcoming: left >= 0,
      }
    })
  })

  function pick(value: string | number | null | undefined, part: 'year' | 'month') {
    if (value == null) return
    emit(
      'update',
      part === 'year' ? `${value}${props.month.slice(4)}` : `${props.month.slice(0, 5)}${value}`,
    )
  }
</script>

<template>
  <Stack gap="lg" class="mx-auto w-full max-w-(--entry-container) px-4 pt-5 pb-16 lg:px-6">
    <Stack gap="md">
      <Inline gap="md" align="center" justify="between">
        <Inline gap="sm" align="baseline">
          <Heading :level="1" size="2xl">Galgame 发售日历</Heading>
          <Text v-if="calendar.items.length" tone="muted" class="tabular-nums">
            {{ calendar.items.length }} 部
          </Text>
        </Inline>
        <Inline gap="sm" align="center" :wrap="false">
          <Select
            :model-value="year"
            :options="years"
            size="sm"
            aria-label="年份"
            class="w-28"
            @update:model-value="pick($event, 'year')"
          />
          <IconButton
            label="上个月"
            size="sm"
            variant="outline"
            tone="neutral"
            @click="emit('update', shiftMonth(month, -1))"
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            label="下个月"
            size="sm"
            variant="outline"
            tone="neutral"
            @click="emit('update', shiftMonth(month, 1))"
          >
            <ChevronRight />
          </IconButton>
          <Button
            size="sm"
            variant="ghost"
            tone="neutral"
            :disabled="month === current"
            @click="emit('update', current)"
          >
            回到本月
          </Button>
        </Inline>
      </Inline>
      <ScrollRail class="-mx-4 lg:mx-0">
        <Stack gap="none" class="w-max px-4 lg:w-full lg:px-0">
          <SegmentedControl
            :model-value="month.slice(5)"
            :options="months"
            aria-label="月份"
            block
            @update:model-value="pick($event, 'month')"
          />
        </Stack>
      </ScrollRail>
    </Stack>
    <Stack gap="none" class="relative">
      <Empty v-if="!tiles.length" title="这个月没有发售的作品" />
      <Grid
        v-else
        :cols="2"
        gap="none"
        class="gap-x-5 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        <GalgameCalendarTile v-for="tile in tiles" :key="tile.item.id" v-bind="tile" />
      </Grid>
      <LoadingOverlay :visible="pending" />
    </Stack>
  </Stack>
</template>
