<script setup lang="ts">
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
  }>()
  const emit = defineEmits<{ changeMonth: [string]; makeUp: [string] }>()

  const confirm = useConfirm()
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
    signed: 'bg-primary/10 font-semibold text-primary',
    'make-up': 'bg-amber-500/15 font-semibold text-amber-600 dark:text-amber-400',
    today: 'font-semibold text-color ring-2 ring-primary',
    missed: '',
    future: 'text-surface-300 dark:text-surface-600',
    normal: 'text-muted-color',
    other: 'text-surface-300 dark:text-surface-700',
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

  function onCellClick(cell: Cell) {
    if (cell.state !== 'missed') return
    const cost = props.status?.make_up.next_cost ?? 0
    const remaining = props.status?.make_up.remaining ?? 0
    confirm.require({
      group: 'app-shell',
      header: '补签',
      message: `补签 ${cell.key}，将消耗 ${cost} 光点。本月剩余补签次数 ${remaining} 次。`,
      acceptLabel: '补签',
      rejectLabel: '取消',
      onAccept: ({ close }) => {
        close()
        emit('makeUp', cell.key)
      },
    })
  }
</script>

<template>
  <div class="px-4 select-none">
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-color">{{ monthLabel }}</span>
        <Button
          v-if="!inCurrentMonth"
          v-tooltip.top="'回到本月'"
          unstyled
          :disabled="loading"
          class="grid size-6 place-items-center rounded-md text-muted-color transition-colors hover:bg-emphasis hover:text-color disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-color"
          aria-label="回到本月"
          @click="backToCurrentMonth"
        >
          <CalendarDays class="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      <div class="flex items-center gap-1">
        <Button
          unstyled
          :disabled="loading"
          class="grid size-7 place-items-center rounded-md text-muted-color transition-colors hover:bg-emphasis disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="上个月"
          @click="shift(-1)"
        >
          <ChevronLeft class="size-4" aria-hidden="true" />
        </Button>
        <Button
          unstyled
          :disabled="loading || atCurrentMonth"
          class="grid size-7 place-items-center rounded-md text-muted-color transition-colors hover:bg-emphasis disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="下个月"
          @click="shift(1)"
        >
          <ChevronRight class="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-7 text-center">
      <span v-for="weekday in WEEKDAYS" :key="weekday" class="pb-1.5 text-xs text-muted-color">
        {{ weekday }}
      </span>
    </div>

    <div class="grid grid-cols-7">
      <div v-for="cell in cells" :key="cell.key" class="flex items-center justify-center py-0.5">
        <Button
          v-if="cell.state === 'missed'"
          unstyled
          class="inline-flex size-9 items-center justify-center rounded-full border border-dashed border-surface-300 text-sm text-muted-color transition-colors hover:bg-emphasis dark:border-surface-600"
          :aria-label="`补签 ${cell.key}`"
          @click="onCellClick(cell)"
        >
          {{ cell.day }}
        </Button>
        <span
          v-else
          class="inline-flex size-9 items-center justify-center rounded-full text-sm"
          :class="CELL_CLASS[cell.state]"
        >
          {{ cell.day }}
        </span>
      </div>
    </div>
  </div>
</template>
