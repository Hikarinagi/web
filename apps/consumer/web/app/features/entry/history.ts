import type { BackendEntryHistory } from '~/features/entry/contract'
import { TimeFormatEnum, formatDate, timeFormat } from '~/utils/time-format'

type Row = BackendEntryHistory['items'][number]

interface Batch {
  key: string
  id: number | null
  summary: string | null
  label: string | null
  rows: Row[]
}

export function historyDays(rows: Row[]) {
  const year = new Date().getFullYear()
  const days: { key: string; label: string; batches: Batch[] }[] = []
  for (const row of rows) {
    const key = timeFormat(row.created_at, TimeFormatEnum.YYYY_MM_DD)
    let day = days.at(-1)
    if (day?.key !== key) {
      const sameYear = new Date(row.created_at).getFullYear() === year
      day = {
        key,
        label: formatDate(row.created_at, sameYear ? 'monthDay' : 'date'),
        batches: [],
      }
      days.push(day)
    }
    const batch = day.batches.at(-1)
    if (batch && row.batch_id !== null && batch.id === row.batch_id) {
      batch.rows.push(row)
      if (row.summary !== batch.summary) batch.label = batch.summary
      continue
    }
    day.batches.push({
      key: `${key}-${day.batches.length}`,
      id: row.batch_id,
      summary: row.batch_summary,
      label: row.batch_summary !== row.summary ? row.batch_summary : null,
      rows: [row],
    })
  }
  return days
}
