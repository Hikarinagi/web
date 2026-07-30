export type GalgameDevStatusValue = 'RELEASED' | 'IN_DEVELOPMENT' | 'CANCELLED'

const VNDB_DEV_STATUS: Record<number, GalgameDevStatusValue> = {
  0: 'RELEASED',
  1: 'IN_DEVELOPMENT',
  2: 'CANCELLED',
}

export function vndbDevStatus(
  code: number | string | null | undefined,
): GalgameDevStatusValue | null {
  if (code == null || code === '') return null
  const n = Number(code)
  return Number.isInteger(n) ? (VNDB_DEV_STATUS[n] ?? null) : null
}
