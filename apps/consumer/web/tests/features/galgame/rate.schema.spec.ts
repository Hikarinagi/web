import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { galgameRateSchema } from '../../../app/features/galgame/schemas/rate.schema'

describe('galgameRateSchema', () => {
  it('accepts a complete record', () => {
    const result = v.safeParse(galgameRateSchema, {
      status: 'COMPLETED',
      rate: 9,
      rate_content: '剧情精彩，演出拉满。',
      time_to_finish_hours: 3.5,
      is_spoiler: true,
      rate_scenario: 9,
      rate_music: 10,
      rate_system: null,
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.output.time_to_finish_hours).toBe(3.5)
    expect(result.output.rate_system).toBeNull()
    expect(result.output.is_spoiler).toBe(true)
  })

  it('rejects an out-of-range or fractional total score', () => {
    for (const rate of [0, 11, 8.5]) {
      expect(v.safeParse(galgameRateSchema, { status: 'GOING', rate }).success).toBe(false)
    }
  })

  it('accepts nullish dimensions and rejects out-of-range ones', () => {
    const ok = v.safeParse(galgameRateSchema, {
      status: 'GOING',
      rate: 8,
      rate_scenario: 10,
      rate_direction: null,
    })
    expect(ok.success).toBe(true)
    if (ok.success) expect(ok.output.rate_direction).toBeNull()

    expect(
      v.safeParse(galgameRateSchema, { status: 'GOING', rate: 8, rate_scenario: 15 }).success,
    ).toBe(false)
    expect(
      v.safeParse(galgameRateSchema, { status: 'GOING', rate: 8, rate_scenario: 2.5 }).success,
    ).toBe(false)
  })

  describe('time_to_finish_hours accepts what the widget really emits', () => {
    const parse = (time_to_finish_hours: unknown) =>
      v.safeParse(galgameRateSchema, { status: 'GOING', rate: 8, time_to_finish_hours })

    it.each([
      [3.5, 3.5],
      [0, 0],
      [9999, 9999],
      [null, null],
      [undefined, null],
    ])('normalizes %o to %o', (input, expected) => {
      const result = parse(input)
      expect(result.success).toBe(true)
      if (result.success) expect(result.output.time_to_finish_hours).toBe(expected)
    })

    it.each([
      [10000, '时长不能超过 9999 小时'],
      [-5, '时长不能为负'],
      ['3.5', '时长应为数字'],
      ['abc', '时长应为数字'],
      [true, '时长应为数字'],
    ])('rejects %o with %s', (input, message) => {
      const result = parse(input)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues[0]?.message).toBe(message)
    })
  })
})

describe('galgame rate hours input', () => {
  // 这里只守调用点的配置：数值格式化交给 hina NumberInput，越界文案由上面的 schema 用例覆盖
  it('is configured without grouping in every dialog that collects hours', async () => {
    const dialogs = ['galgame', 'light-novel']
    for (const dialog of dialogs) {
      const source = await readFile(
        resolve(process.cwd(), `app/components/${dialog}/rate/Dialog.vue`),
        'utf8',
      )
      expect(source).toContain('useGrouping: false')
    }
  })
})
