import { GALGAME_RATE_DIMENSIONS } from '~/features/galgame/rate'
import { LIGHT_NOVEL_RATE_DIMENSIONS } from '~/features/light-novel/rate'

export interface RateDimensionChip {
  label: string
  score: number
}

export const RATE_DIMENSION_LABELS: Record<string, string> = Object.fromEntries(
  [...GALGAME_RATE_DIMENSIONS, ...LIGHT_NOVEL_RATE_DIMENSIONS].map(
    d => [d.key, d.label] as [string, string],
  ),
)

export function pickRateDimensions<T>(
  rate: T,
  dims: ReadonlyArray<{ key: keyof T & string; label: string }>,
): RateDimensionChip[] {
  return dims.flatMap(d => {
    const score = rate[d.key]
    return typeof score === 'number' ? [{ label: d.label, score }] : []
  })
}
