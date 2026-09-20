import type { BackendContributionStats } from '~/features/creator/contribution'
import { TimeFormatEnum, timeFormat } from '~/utils/time-format'

const CELL = 11
const GAP = 3
const STEP = CELL + GAP
const COLUMNS = 53
const ROWS = 7
const WEEK_LABEL_W = 20
const MONTH_LABEL_H = 16

const WEEK_LABELS = ['', '一', '', '三', '', '五', ''] as const
const MONTH_LABELS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
] as const

const LEVEL_CLASSES = [
  'bg-surface-200 dark:bg-surface-800',
  'bg-primary-200 dark:bg-primary-900',
  'bg-primary-400 dark:bg-primary-700',
  'bg-primary-500 dark:bg-primary-500',
  'bg-primary-700 dark:bg-primary-300',
] as const

type HeatmapCell = {
  date: string
  count: number
  level: number
  future: boolean
}
type HeatmapColumn = {
  weekStart: string
  firstMonth: number
  cells: HeatmapCell[]
}
type HeatmapMonthHeader = { col: number; label: string }

export const HEATMAP_DIMENSIONS = {
  cell: CELL,
  step: STEP,
  weekLabelW: WEEK_LABEL_W,
  monthLabelH: MONTH_LABEL_H,
  width: WEEK_LABEL_W + COLUMNS * STEP - GAP,
  height: MONTH_LABEL_H + ROWS * STEP - GAP,
} as const

export const HEATMAP_WEEK_LABELS = WEEK_LABELS
export const HEATMAP_LEVEL_CLASSES = LEVEL_CLASSES

export function useContributionHeatmap(stats: () => BackendContributionStats) {
  const grid = computed<HeatmapColumn[]>(() => {
    const value = stats()
    const counts = new Map<string, number>(value.days.map(d => [d.date, d.count]))

    const todayStr = timeFormat(new Date(), TimeFormatEnum.YYYY_MM_DD, {
      timeZone: 'Asia/Shanghai',
    })
    const [ty, tm, td] = todayStr.split('-').map(Number)
    const today = new Date(Date.UTC(ty!, tm! - 1, td!))
    const saturday = new Date(today)
    saturday.setUTCDate(saturday.getUTCDate() + (6 - today.getUTCDay()))

    const columns: HeatmapColumn[] = []
    for (let w = COLUMNS - 1; w >= 0; w--) {
      const colSunday = new Date(saturday)
      colSunday.setUTCDate(colSunday.getUTCDate() - w * 7 - 6)

      const cells: HeatmapCell[] = []
      for (let r = 0; r < ROWS; r++) {
        const date = new Date(colSunday)
        date.setUTCDate(date.getUTCDate() + r)
        const dateStr = timeFormat(date, TimeFormatEnum.YYYY_MM_DD, {
          timeZone: 'Asia/Shanghai',
        })
        const count = counts.get(dateStr) ?? 0
        const level = count <= 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4
        cells.push({ date: dateStr, count, level, future: dateStr > todayStr })
      }
      columns.push({
        weekStart: timeFormat(colSunday, TimeFormatEnum.YYYY_MM_DD, {
          timeZone: 'Asia/Shanghai',
        }),
        firstMonth: colSunday.getUTCMonth(),
        cells,
      })
    }
    return columns
  })

  const monthHeaders = computed<HeatmapMonthHeader[]>(() => {
    const headers: HeatmapMonthHeader[] = []
    let last = -1
    grid.value.forEach((col, index) => {
      if (col.firstMonth !== last) {
        headers.push({ col: index, label: MONTH_LABELS[col.firstMonth]! })
        last = col.firstMonth
      }
    })
    return headers
  })

  return { grid, monthHeaders }
}

export function heatmapTooltip(cell: HeatmapCell): string {
  if (cell.future) return cell.date
  return cell.count === 0 ? `${cell.date} 无贡献` : `${cell.date} 共 ${cell.count} 次贡献`
}
