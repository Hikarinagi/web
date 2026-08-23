import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import Form from '@primevue/forms/form'
import FormField from '@primevue/forms/formfield'
import PrimeVue from 'primevue/config'
import InputNumber from 'primevue/inputnumber'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import * as v from 'valibot'
import {
  galgameRateResolver,
  galgameRateSchema,
} from '../../../app/features/galgame/schemas/rate.schema'

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

  // PrimeVue's InputNumber registers its inner InputText under the same form field name, so on
  // mobile IME input the raw DOM string — not a number — is what reaches the resolver.
  describe('time_to_finish_hours accepts what the widget really emits', () => {
    const parse = (time_to_finish_hours: unknown) =>
      v.safeParse(galgameRateSchema, { status: 'GOING', rate: 8, time_to_finish_hours })

    it.each([
      [3.5, 3.5],
      ['3.5', 3.5],
      [0, 0],
      [9999, 9999],
      ['9999', 9999],
      ['', null],
      [null, null],
      [undefined, null],
    ])('normalizes %o to %o', (input, expected) => {
      const result = parse(input)
      expect(result.success).toBe(true)
      if (result.success) expect(result.output.time_to_finish_hours).toBe(expected)
    })

    it.each([
      [10000, '时长不能超过 9999 小时'],
      ['10000', '时长不能超过 9999 小时'],
      [-5, '时长不能为负'],
      ['-5', '时长不能为负'],
      ['abc', '时长应为数字'],
      ['-', '时长应为数字'],
      ['1,234', '时长应为数字'],
      [true, '时长应为数字'],
    ])('rejects %o with %s', (input, message) => {
      const result = parse(input)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues[0]?.message).toBe(message)
    })
  })
})

describe('galgame rate hours input', () => {
  type FieldState = { invalid?: boolean; error?: { message?: string } | null }

  async function typeWithIme(digits: string[]) {
    const seen: FieldState[] = []
    const Host = defineComponent({
      render: () =>
        h(
          Form,
          { resolver: galgameRateResolver, initialValues: { time_to_finish_hours: null } },
          {
            default: ($form: Record<string, FieldState>) => {
              seen.push($form.time_to_finish_hours ?? {})
              return h(
                FormField,
                { name: 'time_to_finish_hours' },
                {
                  // must mirror the props used by components/galgame/rate/Dialog.vue
                  default: () => h(InputNumber, { maxFractionDigits: 1, useGrouping: false }),
                },
              )
            },
          },
        ),
    })

    const wrapper = mount(Host, { global: { plugins: [[PrimeVue, {}]] } })
    await nextTick()
    const input = wrapper.find('input.p-inputnumber-input').element as HTMLInputElement

    const steps: { displayed: string; invalid?: boolean; error?: string }[] = []
    for (const digit of digits) {
      // a soft keyboard commits through a native `input` event; it fires no `keypress`,
      // which is the only channel InputNumber parses on
      input.value = input.value + digit
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 20))
      const state = seen.at(-1)
      steps.push({
        displayed: input.value,
        invalid: state?.invalid,
        error: state?.error?.message,
      })
    }
    return steps
  }

  it('never renders NaN and stays valid while an in-range value is typed', async () => {
    const steps = await typeWithIme(['1', '2', '3', '4'])
    expect(steps.map(step => step.displayed)).toEqual(['1', '12', '123', '1234'])
    expect(steps.every(step => step.invalid === false)).toBe(true)
  })

  // the schema rejects a grouped string rather than silently turning it into NaN, but the input
  // would still *render* "NaN"; use-grouping="false" is what keeps a grouped string from forming
  it('is configured without grouping in every dialog that collects hours', async () => {
    const dialogs = ['galgame', 'light-novel']
    for (const dialog of dialogs) {
      const source = await readFile(
        resolve(process.cwd(), `app/components/${dialog}/rate/Dialog.vue`),
        'utf8',
      )
      expect(source).toContain(':use-grouping="false"')
    }
  })

  it('reports the real reason once the typed value leaves the range', async () => {
    const steps = await typeWithIme(['1', '2', '3', '4', '5'])
    expect(steps.at(-1)).toMatchObject({
      displayed: '12345',
      invalid: true,
      error: '时长不能超过 9999 小时',
    })
  })
})
