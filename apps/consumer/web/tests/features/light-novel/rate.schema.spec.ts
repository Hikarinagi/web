import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { lightNovelRateSchema } from '../../../app/features/light-novel/schemas/rate.schema'

describe('lightNovelRateSchema', () => {
  it('accepts a complete record with all six dimensions', () => {
    const result = v.safeParse(lightNovelRateSchema, {
      status: 'GOING',
      rate: 8,
      rate_content: '文笔流畅，插画优秀。',
      time_to_finish_hours: 2.5,
      is_spoiler: false,
      rate_plot: 8,
      rate_character: 9,
      rate_writing: 8,
      rate_worldview: 9,
      rate_pacing: 7,
      rate_illustration: 10,
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.output.time_to_finish_hours).toBe(2.5)
    expect(result.output.rate_illustration).toBe(10)
  })

  // shares the `hours` schema with galgame; see tests/features/galgame/rate.schema.spec.ts
  // for the full matrix of what PrimeVue's InputNumber emits under a mobile IME
  describe('time_to_finish_hours', () => {
    const parse = (time_to_finish_hours: unknown) =>
      v.safeParse(lightNovelRateSchema, { status: 'GOING', rate: 8, time_to_finish_hours })

    it('coerces the raw string an IME commit produces', () => {
      const result = parse('2.5')
      expect(result.success).toBe(true)
      if (result.success) expect(result.output.time_to_finish_hours).toBe(2.5)
    })

    it('rejects a grouped string instead of turning it into NaN', () => {
      const result = parse('1,234')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues[0]?.message).toBe('时长应为数字')
    })

    it('rejects an over-range value', () => {
      const result = parse(50000)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues[0]?.message).toBe('时长不能超过 9999 小时')
    })
  })
})
