<script setup lang="ts">
  import { Grid, Heading, Stack, Tag, Text } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { daysBetween, weekdayLabel } from '~/features/landing/labels'

  type Item = GalgamesCalendarPageData['calendar']['items'][number]

  defineOptions({ name: 'GalgameCalendarDay' })
  const props = defineProps<{ date: string; list: Item[]; today: string }>()

  const left = computed(() => (props.date ? daysBetween(props.today, props.date) : -1))
  const weekday = computed(() => (props.date ? weekdayLabel(props.date) : ''))
</script>

<template>
  <Grid
    :id="date ? `day-${date}` : undefined"
    as="section"
    gap="none"
    class="scroll-mt-[calc(var(--app-header-height)+1rem)] grid-cols-1 gap-x-7 gap-y-4 border-t border-line py-7 sm:grid-cols-[var(--calendar-date-rail)_minmax(0,1fr)]"
  >
    <Stack
      gap="none"
      class="gap-0.5 self-start max-sm:flex-row max-sm:flex-wrap max-sm:items-baseline max-sm:gap-x-3 sm:sticky sm:top-[calc(var(--app-header-height)+1rem)]"
    >
      <Heading
        v-if="date"
        :level="2"
        :aria-label="`${Number(date.slice(5, 7))} 月 ${Number(date.slice(8))} 日`"
        :class="
          cn(
            'text-6xl leading-none font-black tracking-tight tabular-nums max-sm:text-4xl',
            left >= 0 && 'text-accent-text',
          )
        "
      >
        {{ Number(date.slice(8)) }}
      </Heading>
      <Heading v-else :level="2" class="text-3xl leading-tight font-black">日期未定</Heading>
      <Text
        v-if="weekday"
        weight="semibold"
        :class="
          cn(
            'sm:mt-1.5',
            weekday === '周六' && 'text-info-text',
            weekday === '周日' && 'text-danger-text',
          )
        "
      >
        {{ weekday }}
      </Text>
      <Tag v-if="date && left === 0" variant="solid" tone="warning" class="self-start">今天</Tag>
      <Text
        v-else-if="date"
        size="sm"
        :weight="left > 0 ? 'semibold' : 'normal'"
        :tone="left > 0 ? 'accent' : 'muted'"
        class="tabular-nums"
      >
        {{ left > 0 ? `还有 ${left} 天` : '已发售' }}
      </Text>
      <Text v-if="list.length > 1" size="xs" tone="faint" class="font-mono tabular-nums sm:mt-1">
        {{ list.length }} 部
      </Text>
    </Stack>
    <Grid
      v-if="list.length <= 2"
      gap="xl"
      :cols="1"
      :class="cn('min-w-0', list.length === 2 && 'xl:grid-cols-2')"
    >
      <GalgameCalendarSpot v-for="item in list" :key="item.id" :item="item" />
    </Grid>
    <GalgameCalendarShelf v-else :list="list" />
  </Grid>
</template>
