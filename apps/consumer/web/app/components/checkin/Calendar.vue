<script setup lang="ts">
  import { Button, Grid, Inline, Stack, Text } from '@hina-ui/vue'
  import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'
  import { buildCells } from '~/features/checkin/calendar'
  import type { CheckInRecord, CheckInStatus } from '~/features/checkin/checkin'
  import { monthOf, pad2 } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinCalendar' })

  const props = defineProps<{
    records: CheckInRecord[]
    status: CheckInStatus | null
    month: string
    recordsMonth: string
    loading: boolean
  }>()
  const emit = defineEmits<{
    changeMonth: [string]
    makeUp: [string, 'points' | 'card']
    purchase: [string]
  }>()

  const now = new Date()
  const currentMonth = monthOf(now)

  const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

  const view = computed(() => {
    const [year, month] = props.month.split('-')
    return { year: Number(year), month0: Number(month) - 1 }
  })
  const monthLabel = computed(() => `${view.value.year} 年 ${view.value.month0 + 1} 月`)
  const inCurrentMonth = computed(() => props.month === currentMonth)
  const atCurrentMonth = computed(() => props.month >= currentMonth)

  const cells = computed(() =>
    buildCells({
      month: props.month,
      records: props.records,
      status: props.status,
      ready: props.recordsMonth === props.month,
      now,
    }),
  )

  function shift(delta: number) {
    const { year, month0 } = view.value
    const target = new Date(year, month0 + delta, 1)
    emit('changeMonth', `${target.getFullYear()}-${pad2(target.getMonth() + 1)}`)
  }

  function backToCurrentMonth() {
    if (props.loading || inCurrentMonth.value) return
    emit('changeMonth', currentMonth)
  }
</script>

<template>
  <Stack gap="sm" class="select-none">
    <Inline justify="between">
      <Inline gap="sm">
        <Text as="span" size="sm" weight="semibold">{{ monthLabel }}</Text>
        <Button
          v-if="!inCurrentMonth"
          v-tooltip="'回到本月'"
          variant="ghost"
          tone="neutral"
          size="sm"
          icon-only
          class="size-6"
          :disabled="loading"
          aria-label="回到本月"
          @click="backToCurrentMonth"
        >
          <CalendarDays />
        </Button>
      </Inline>
      <Inline gap="xs">
        <Button
          variant="ghost"
          tone="neutral"
          size="sm"
          icon-only
          :disabled="loading"
          aria-label="上个月"
          @click="shift(-1)"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          tone="neutral"
          size="sm"
          icon-only
          :disabled="loading || atCurrentMonth"
          aria-label="下个月"
          @click="shift(1)"
        >
          <ChevronRight />
        </Button>
      </Inline>
    </Inline>

    <Grid :cols="7" gap="none" class="text-center">
      <Text v-for="weekday in WEEKDAYS" :key="weekday" as="span" size="xs" tone="muted">
        {{ weekday }}
      </Text>
    </Grid>

    <Grid :cols="7" gap="none">
      <CheckinCalendarDay
        v-for="cell in cells"
        :key="cell.key"
        :cell="cell"
        :status="status"
        @make-up="(date, method) => emit('makeUp', date, method)"
        @purchase="emit('purchase', $event)"
      />
    </Grid>
  </Stack>
</template>
