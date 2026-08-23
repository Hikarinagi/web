import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { volumeRateSchema } from '../../../app/features/light-novel-volume/schemas/rate.schema'

describe('volumeRateSchema', () => {
  it('accepts a volume rate, which carries no status or duration', () => {
    const result = v.safeParse(volumeRateSchema, {
      rate: 9,
      rate_content: '第 1 卷非常精彩！',
      is_spoiler: true,
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.output.rate).toBe(9)
    expect(result.output.is_spoiler).toBe(true)
  })

  it('defaults an omitted spoiler flag to false', () => {
    const result = v.safeParse(volumeRateSchema, { rate: 7 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.output.is_spoiler).toBe(false)
  })

  it('rejects an out-of-range score', () => {
    for (const rate of [0, 11]) {
      expect(v.safeParse(volumeRateSchema, { rate }).success).toBe(false)
    }
  })
})
