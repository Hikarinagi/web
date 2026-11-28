import { translate } from '~/utils/i18n'

const partsOf = (value: string | Date) =>
  (typeof value === 'string' ? value : value.toISOString()).slice(0, 10).split('-').map(Number)

export function dateText(value?: string | Date | null, precision?: string | null) {
  if (!value) return ''
  const [year, month, day] = partsOf(value)
  if (precision === 'YEAR') return translate('time.year', { year })
  if (precision === 'MONTH') return translate('time.yearMonth', { year, month })
  return translate('time.date', { year, month, day })
}

export function monthText(value?: string | Date | null, precision?: string | null) {
  if (!value) return ''
  const [year, month] = partsOf(value)
  return precision === 'YEAR'
    ? translate('time.year', { year })
    : translate('time.yearMonth', { year, month })
}
