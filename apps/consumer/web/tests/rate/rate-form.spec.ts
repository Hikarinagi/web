import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { galgameRateSchema } from '../../app/features/galgame/schemas/rate.schema'
import { volumeRateSchema } from '../../app/features/light-novel-volume/schemas/rate.schema'
import { lightNovelRateSchema } from '../../app/features/light-novel/schemas/rate.schema'
import { mangaRateSchema } from '../../app/features/manga/schemas/rate.schema'

describe('Rate Form Validation & Conversion Rigorous Tests', () => {
  describe('galgameRateSchema', () => {
    it('validates a standard complete galgame rate record', () => {
      const result = v.safeParse(galgameRateSchema, {
        status: 'COMPLETED',
        rate: 9,
        rate_content: '剧情精彩，演出拉满。',
        time_to_finish_hours: 3.5,
        is_spoiler: true,
        rate_scenario: 9,
        rate_direction: 8,
        rate_music: 10,
        rate_visual: 9,
        rate_character: 8,
        rate_system: null,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.status).toBe('COMPLETED')
        expect(result.output.rate).toBe(9)
        expect(result.output.time_to_finish_hours).toBe(3.5)
        expect(result.output.is_spoiler).toBe(true)
        expect(result.output.rate_music).toBe(10)
        expect(result.output.rate_system).toBeNull()

        // Test minutes conversion
        const minutes =
          result.output.time_to_finish_hours != null
            ? Math.round(Number(result.output.time_to_finish_hours) * 60)
            : 0
        expect(minutes).toBe(210)
      }
    })

    it('gracefully normalizes empty string and null for hours without NaN', () => {
      const fromEmptyStr = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8,
        time_to_finish_hours: '',
      })
      expect(fromEmptyStr.success).toBe(true)
      if (fromEmptyStr.success) {
        expect(fromEmptyStr.output.time_to_finish_hours).toBeNull()
        const minutes =
          fromEmptyStr.output.time_to_finish_hours != null
            ? Math.round(Number(fromEmptyStr.output.time_to_finish_hours) * 60)
            : 0
        expect(minutes).toBe(0)
        expect(Number.isNaN(minutes)).toBe(false)
      }

      const fromNull = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8,
        time_to_finish_hours: null,
      })
      expect(fromNull.success).toBe(true)
      if (fromNull.success) {
        expect(fromNull.output.time_to_finish_hours).toBeNull()
      }
    })

    it('coerces valid string numeric hours to numbers', () => {
      const result = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8,
        time_to_finish_hours: '4.2',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.time_to_finish_hours).toBe(4.2)
        const minutes = Math.round(Number(result.output.time_to_finish_hours) * 60)
        expect(minutes).toBe(252)
      }
    })

    it('strictly rejects hours exceeding 9999 or below 0 with explicit messages', () => {
      const resultHuge = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8,
        time_to_finish_hours: 10000,
      })
      expect(resultHuge.success).toBe(false)
      if (!resultHuge.success) {
        const msg = resultHuge.issues.map(i => i.message).join(',')
        expect(msg).toContain('时长不能超过 9999 小时')
      }

      const resultNeg = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8,
        time_to_finish_hours: -5,
      })
      expect(resultNeg.success).toBe(false)
      if (!resultNeg.success) {
        const msg = resultNeg.issues.map(i => i.message).join(',')
        expect(msg).toContain('时长不能为负')
      }
    })

    it('rejects non-integer or out-of-range total rate scores', () => {
      const resultDecimal = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8.5,
      })
      expect(resultDecimal.success).toBe(false)

      const resultZero = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 0,
      })
      expect(resultZero.success).toBe(false)

      const resultOver10 = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 11,
      })
      expect(resultOver10.success).toBe(false)
    })

    it('validates dimension scores and accepts nullish values', () => {
      const result = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8,
        rate_scenario: 10,
        rate_direction: null,
        rate_music: '',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.rate_scenario).toBe(10)
        expect(result.output.rate_direction).toBeNull()
        expect(result.output.rate_music).toBeNull()
      }

      const resultInvalidDim = v.safeParse(galgameRateSchema, {
        status: 'GOING',
        rate: 8,
        rate_scenario: 15,
      })
      expect(resultInvalidDim.success).toBe(false)
    })
  })

  describe('lightNovelRateSchema', () => {
    it('validates a light novel rate with 6 dimensions and hours', () => {
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
      if (result.success) {
        expect(result.output.rate).toBe(8)
        expect(result.output.rate_illustration).toBe(10)
        expect(result.output.time_to_finish_hours).toBe(2.5)
      }
    })

    it('rejects hours exceeding 9999 for light novels', () => {
      const result = v.safeParse(lightNovelRateSchema, {
        status: 'GOING',
        rate: 8,
        time_to_finish_hours: 50000,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('volumeRateSchema (Light Novel Volume)', () => {
    it('validates a volume rate without status or hours', () => {
      const result = v.safeParse(volumeRateSchema, {
        rate: 9,
        rate_content: '第 1 卷非常精彩！',
        is_spoiler: true,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.rate).toBe(9)
        expect(result.output.is_spoiler).toBe(true)
      }
    })

    it('rejects invalid rate scores for volume', () => {
      const result = v.safeParse(volumeRateSchema, {
        rate: 0,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('mangaRateSchema', () => {
    it('validates a manga rate with status, rate and spoiler', () => {
      const result = v.safeParse(mangaRateSchema, {
        status: 'COMPLETED',
        rate: 9,
        rate_content: '分镜极佳。',
        is_spoiler: false,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.status).toBe('COMPLETED')
        expect(result.output.rate).toBe(9)
        expect(result.output.is_spoiler).toBe(false)
      }
    })

    it('rejects illegal status string', () => {
      const result = v.safeParse(mangaRateSchema, {
        status: 'INVALID_STATUS',
        rate: 8,
      })
      expect(result.success).toBe(false)
    })
  })
})
