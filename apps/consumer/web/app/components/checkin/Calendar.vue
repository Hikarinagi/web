<script setup lang="ts">
  import { Button, Center, Grid, Inline, Popconfirm, Stack, Text } from '@hina-ui/vue'
  import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { CheckInRecord, CheckInStatus } from '~/features/checkin/checkin'
  import { dayKeyOf, monthOf, pad2 } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinCalendar' })

  const props = defineProps<{
    records: CheckInRecord[]
    status: CheckInStatus | null
    month: string
    recordsMonth: string
    loading: boolean
    makeUp: (date: string) => Promise<void>
  }>()
  const emit = defineEmits<{ changeMonth: [string] }>()

  const now = new Date()
  const todayKey = dayKeyOf(now)
  const currentMonth = monthOf(now)

  const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

  type CellState = 'signed' | 'make-up' | 'today' | 'missed' | 'future' | 'normal' | 'other'

  interface Cell {
    key: string
    day: number
    state: CellState
  }

  const recordMap = computed(() => {
    const map = new Map<string, CheckInRecord>()
    for (const record of props.records) map.set(record.date, record)
    return map
  })

  const view = computed(() => {
    const [year, month] = props.month.split('-')
    return { year: Number(year), month0: Number(month) - 1 }
  })
  const monthLabel = computed(() => `${view.value.year} 年 ${view.value.month0 + 1} 月`)
  const inCurrentMonth = computed(() => props.month === currentMonth)
  const atCurrentMonth = computed(() => props.month >= currentMonth)

  function isMakeable(key: string, inMonth: boolean) {
    if (!inMonth) return false
    if (recordMap.value.has(key)) return false
    if (key >= todayKey) return false
    return key.slice(0, 7) === currentMonth
  }

  function cellState(key: string, inMonth: boolean): CellState {
    if (!inMonth) return 'other'
    const record = recordMap.value.get(key)
    if (record) return record.is_make_up ? 'make-up' : 'signed'
    if (key === todayKey) return 'today'
    if (isMakeable(key, inMonth)) return 'missed'
    if (key > todayKey) return 'future'
    return 'normal'
  }

  const cells = computed<Cell[]>(() => {
    const { year, month0 } = view.value
    const ready = props.recordsMonth === props.month
    const lead = (new Date(year, month0, 1).getDay() + 6) % 7
    const start = new Date(year, month0, 1 - lead)
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      const key = dayKeyOf(date)
      const inMonth = date.getMonth() === month0 && date.getFullYear() === year
      const state = ready ? cellState(key, inMonth) : inMonth ? 'normal' : 'other'
      return { key, day: date.getDate(), state }
    })
  })

  const CELL_CLASS: Record<CellState, string> = {
    signed: 'bg-accent/10 font-semibold text-accent-text',
    'make-up': 'bg-amber-500/15 font-semibold text-amber-600 dark:text-amber-400',
    today: 'ring-accent font-semibold ring-2',
    missed: '',
    future: 'text-disabled',
    normal: 'text-muted',
    other: 'text-disabled opacity-60',
  }

  function shift(delta: number) {
    const { year, month0 } = view.value
    const target = new Date(year, month0 + delta, 1)
    emit('changeMonth', `${target.getFullYear()}-${pad2(target.getMonth() + 1)}`)
  }

  function backToCurrentMonth() {
    if (props.loading || inCurrentMonth.value) return
    emit('changeMonth', currentMonth)
  }

  function makeUpHint(cell: Cell) {
    const cost = props.status?.make_up.next_cost ?? 0
    const remaining = props.status?.make_up.remaining ?? 0
    return `补签 ${cell.key}，将消耗 ${cost} 光点。本月剩余补签次数 ${remaining} 次。`
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
      <Center v-for="cell in cells" :key="cell.key" class="py-0.5">
        <Popconfirm
          v-if="cell.state === 'missed'"
          title="补签"
          :description="makeUpHint(cell)"
          confirm-text="补签"
          @confirm="() => props.makeUp(cell.key)"
        >
          <Button
            variant="ghost"
            tone="neutral"
            pill
            class="size-9 border border-dashed border-line-strong text-sm"
            :aria-label="`补签 ${cell.key}`"
          >
            {{ cell.day }}
          </Button>
        </Popconfirm>
        <Center
          v-else
          as="span"
          class="size-9 rounded-full text-sm"
          :class="CELL_CLASS[cell.state]"
        >
          {{ cell.day }}
        </Center>
      </Center>
    </Grid>
  </Stack>
</template>
