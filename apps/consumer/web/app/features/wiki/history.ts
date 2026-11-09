const pad = (value: number) => String(value).padStart(2, '0')

export function versionName(at: string | Date): string {
  const date = new Date(at)
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${day} ${pad(date.getHours())}:${pad(date.getMinutes())} 的版本`
}

export function readPage(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number(raw)
  return Number.isInteger(page) && page > 0 ? page : 1
}
