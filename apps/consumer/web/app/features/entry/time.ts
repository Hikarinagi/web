export function revisionTime(value: string | Date): string {
  const date = new Date(value)
  const clock = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const day = `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  return date.getFullYear() === new Date().getFullYear()
    ? `${day} ${clock}`
    : `${date.getFullYear()} 年 ${day} ${clock}`
}
