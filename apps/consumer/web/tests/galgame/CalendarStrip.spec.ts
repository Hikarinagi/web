import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Day from '../../app/components/galgame/calendar/Day.vue'
import Strip from '../../app/components/galgame/calendar/Strip.vue'

const stubs = { GalgameCalendarItem: { props: ['item'], template: '<a>{{ item.id }}</a>' } }

function strip(counts: [string, number][]) {
  return mount(Strip, {
    props: { month: '2026-11', today: '2026-11-22', counts: new Map(counts), picked: null },
    global: { stubs },
  })
}

describe('GalgameCalendarStrip', () => {
  it('lays out every day of the month and makes only the days with works pickable', async () => {
    const wrapper = strip([
      ['2026-11-05', 1],
      ['2026-11-27', 9],
    ])
    expect(wrapper.findAll('[role=group] > *')).toHaveLength(30)
    const buttons = wrapper.findAll('button')
    expect(buttons.map(button => button.attributes('aria-label'))).toEqual([
      '5 日，1 部作品',
      '27 日，9 部作品',
    ])
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('pick')).toEqual([['2026-11-27']])
  })

  it('marks today and adds a cell for the works whose day is not set', () => {
    const wrapper = strip([['', 2]])
    expect(wrapper.get('[data-today]').text()).toContain('今天')
    expect(wrapper.findAll('[role=group] > *')).toHaveLength(31)
    expect(wrapper.get('button').attributes('aria-label')).toBe('日期未定，2 部作品')
  })
})

describe('GalgameCalendarDay', () => {
  const day = (date: string) =>
    mount(Day, {
      props: { date, list: [{ id: 1 }, { id: 2 }] as never, today: '2026-11-22' },
      global: { stubs },
    })

  it('counts down to a coming day and marks a past one as released', () => {
    expect(day('2026-11-27').text()).toContain('还有 5 天')
    expect(day('2026-11-22').text()).toContain('今天')
    expect(day('2026-11-05').text()).toContain('已发售')
    expect(day('2026-11-27').text()).toContain('2 部')
  })

  it('heads the works without a day as not yet dated', () => {
    const wrapper = day('')
    expect(wrapper.get('h2').text()).toBe('日期未定')
    expect(wrapper.attributes('id')).toBe('day-undated')
  })
})
