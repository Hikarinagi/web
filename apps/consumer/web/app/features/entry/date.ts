export function monthText(value?: string | Date | null) {
  if (!value) return ''
  const [year, month] = (typeof value === 'string' ? value : value.toISOString())
    .slice(0, 7)
    .split('-')
  return `${year} 年 ${Number(month)} 月`
}

export function dayText(value?: string | Date | null) {
  if (!value) return ''
  const [year, month, day] = (typeof value === 'string' ? value : value.toISOString())
    .slice(0, 10)
    .split('-')
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`
}
