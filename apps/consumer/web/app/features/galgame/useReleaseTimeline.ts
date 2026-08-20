import {
  releasePeriodLabel,
  releasePeriodsLabel,
  releaseRangeLabel,
  type GalgameHistogram,
  type ReleaseFilterMode,
} from './explore'

export type TimelineRangeUpdate = {
  from?: string
  periods?: string[]
  to?: string
}
export type TimelinePanelProps = {
  histogram: GalgameHistogram
  from?: string
  periods: string[]
  to?: string
}
type TimelinePanelEmit = (event: 'update', value: TimelineRangeUpdate) => void
type Option<T> = { label: string; value: T }

const MODE_OPTIONS: Option<ReleaseFilterMode>[] = [
  { label: '范围', value: 'range' },
  { label: '指定', value: 'periods' },
]
const MONTH_OPTIONS: Option<number>[] = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1
  return { label: `${month}月`, value: month }
})
const CURRENT_YEAR = new Date().getFullYear()

export function useReleaseTimeline(props: TimelinePanelProps, emit: TimelinePanelEmit) {
  const selectedYears = computed(() =>
    [yearOf(props.from), yearOf(props.to), ...props.periods.map(yearOf)].filter(
      (item): item is number => item != null,
    ),
  )
  const minYear = computed(() => Math.min(props.histogram.min_year ?? 1990, ...selectedYears.value))
  const maxYear = computed(() =>
    Math.max(props.histogram.max_year ?? new Date().getFullYear(), ...selectedYears.value),
  )
  const buckets = computed(
    () => new Map(props.histogram.buckets.map(bucket => [bucket.year, bucket])),
  )
  const mode = ref<ReleaseFilterMode>(props.periods.length ? 'periods' : 'range')
  const rangeFromYear = ref(yearOf(props.from) ?? minYear.value)
  const rangeFromMonth = ref<number | null>(monthOf(props.from))
  const rangeToYear = ref(yearOf(props.to) ?? yearOf(props.from) ?? maxYear.value)
  const rangeToMonth = ref<number | null>(monthOf(props.to))
  const rangeYears = ref<[number, number]>([rangeFromYear.value, rangeToYear.value])
  const { start: commitYearRange, stop: cancelYearRange } = useTimeoutFn(
    () => {
      if (mode.value === 'range') commitRange()
    },
    300,
    { immediate: false },
  )
  const yearOptions = computed<Option<number>[]>(() =>
    Array.from({ length: maxYear.value - minYear.value + 1 }, (_, index) => {
      const year = minYear.value + index
      const count = buckets.value.get(year)?.count
      return { label: count ? `${year}年 · ${count}` : `${year}年`, value: year }
    }),
  )
  const periodYearOptions = computed<Option<number>[]>(() =>
    [...yearOptions.value].sort((a, b) => comparePeriodYear(a.value, b.value)),
  )
  const periodOptions = computed<Option<string>[]>(() =>
    periodYearOptions.value.flatMap(option => {
      const year = option.value
      return [
        { label: option.label, value: String(year) },
        ...MONTH_OPTIONS.map(month => ({
          label: `${year}年${month.value}月`,
          value: periodOf(year, month.value),
        })),
      ]
    }),
  )
  const selectedLabel = computed(() =>
    props.periods.length
      ? releasePeriodsLabel(props.periods)
      : releaseRangeLabel(props.from, props.to),
  )
  const hasSelection = computed(() => Boolean(props.from || props.to || props.periods.length))

  watch(
    () => [props.from, props.to, props.periods.join(','), minYear.value, maxYear.value],
    () => {
      if (props.periods.length) {
        cancelYearRange()
        mode.value = 'periods'
        return
      }

      cancelYearRange()
      mode.value = 'range'
      rangeFromYear.value = yearOf(props.from) ?? minYear.value
      rangeFromMonth.value = monthOf(props.from)
      rangeToYear.value = yearOf(props.to) ?? yearOf(props.from) ?? maxYear.value
      rangeToMonth.value = monthOf(props.to)
      syncYears()
    },
  )

  function changeMode(value: unknown) {
    if (value !== 'range' && value !== 'periods') return

    cancelYearRange()
    mode.value = value
    if (value === 'range' && props.periods.length) {
      emit('update', { periods: [] })
    } else if (value === 'periods' && (props.from || props.to)) {
      emit('update', { from: undefined, to: undefined })
    }
  }

  function changeFromYear(value: unknown) {
    if (typeof value !== 'number') return

    cancelYearRange()
    rangeFromYear.value = value
    syncYears()
    commitRange()
  }

  function changeFromMonth(value: unknown) {
    if (typeof value !== 'number' && value != null) return

    cancelYearRange()
    rangeFromMonth.value = value ?? null
    commitRange()
  }

  function changeToYear(value: unknown) {
    if (typeof value !== 'number') return

    cancelYearRange()
    rangeToYear.value = value
    syncYears()
    commitRange()
  }

  function changeToMonth(value: unknown) {
    if (typeof value !== 'number' && value != null) return

    cancelYearRange()
    rangeToMonth.value = value ?? null
    commitRange()
  }

  function changeYearRange(value: unknown) {
    const next = toYearRange(value)
    if (!next) return

    rangeYears.value = next
    rangeFromYear.value = next[0]
    rangeToYear.value = next[1]
    commitYearRange()
  }

  function changePeriods(value: unknown) {
    cancelYearRange()
    mode.value = 'periods'
    emit('update', {
      from: undefined,
      periods: normalizePeriods(value),
      to: undefined,
    })
  }

  function clear() {
    cancelYearRange()
    emit('update', {
      from: undefined,
      periods: [],
      to: undefined,
    })
  }

  function commitRange() {
    mode.value = 'range'
    const [from, to] = orderedPeriods(
      boundOf(rangeFromYear.value, rangeFromMonth.value),
      boundOf(rangeToYear.value, rangeToMonth.value),
    )
    emit('update', { from, periods: [], to })
  }

  function syncYears() {
    rangeYears.value = toYearRange([rangeFromYear.value, rangeToYear.value]) ?? rangeYears.value
  }

  return {
    changeFromMonth,
    changeFromYear,
    changeMode,
    changePeriods,
    changeToMonth,
    changeToYear,
    changeYearRange,
    clear,
    hasSelection,
    maxYear,
    minYear,
    mode,
    modeOptions: MODE_OPTIONS,
    monthOptions: MONTH_OPTIONS,
    periodOptions,
    rangeFromMonth,
    rangeFromYear,
    rangeToMonth,
    rangeToYear,
    rangeYears,
    releasePeriodLabel,
    selectedLabel,
    yearOptions,
  }
}

function normalizePeriods(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return [...new Set(value.filter((item): item is string => isPeriod(item)))].sort((a, b) =>
    startKey(a).localeCompare(startKey(b)),
  )
}

function comparePeriodYear(a: number, b: number): number {
  if (a === CURRENT_YEAR) return -1
  if (b === CURRENT_YEAR) return 1

  const aPast = a < CURRENT_YEAR
  const bPast = b < CURRENT_YEAR
  if (aPast && bPast) return b - a
  if (!aPast && !bPast) return a - b

  return aPast ? 1 : -1
}

function orderedPeriods(from: string, to: string): [string, string] {
  return startKey(from) <= startKey(to) ? [from, to] : [to, from]
}

function toYearRange(value: unknown): [number, number] | null {
  if (!Array.isArray(value)) return null
  const [start, end] = value
  if (typeof start !== 'number' || typeof end !== 'number') return null

  return start <= end ? [start, end] : [end, start]
}

function isPeriod(value: string): boolean {
  return /^(?:19\d{2}|20\d{2}|21\d{2}|2200)(?:-(?:0[1-9]|1[0-2]))?$/.test(value)
}

function periodOf(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

// 月份留空时退化为整年（YYYY）,后端按全年范围解释
function boundOf(year: number, month: number | null): string {
  return month == null ? String(year) : periodOf(year, month)
}

function startKey(value: string): string {
  return value.length === 4 ? `${value}-01` : value
}

function yearOf(value: string | undefined): number | null {
  if (!value) return null

  const year = Number(value.slice(0, 4))
  return Number.isInteger(year) ? year : null
}

function monthOf(value: string | undefined): number | null {
  if (!value || value.length === 4) return null

  const month = Number(value.slice(5, 7))
  return Number.isInteger(month) ? month : null
}
