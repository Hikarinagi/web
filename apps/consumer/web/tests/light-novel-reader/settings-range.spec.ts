import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Range from '~/components/light-novel-reader/settings/Range.vue'

function mountRange(props: { value: number; max?: number; defaultValue?: number }) {
  return mount(Range, {
    props: { label: '页面宽度', min: 480, max: 1920, step: 20, ...props },
    attachTo: document.body,
  })
}

const button = '[aria-label="恢复默认"]'

describe('滑块的恢复默认按钮', () => {
  it('当前值就是默认值时隐藏按钮，但保留位置', () => {
    const wrapper = mountRange({ value: 900, defaultValue: 900 })

    expect(wrapper.find(button).classes()).toContain('invisible')
    wrapper.unmount()
  })

  it('改过之后显示按钮，点击写回默认值', async () => {
    const wrapper = mountRange({ value: 1200, defaultValue: 900 })
    expect(wrapper.find(button).classes()).not.toContain('invisible')

    await wrapper.find(button).trigger('click')

    expect(wrapper.emitted('change')).toEqual([[900]])
    wrapper.unmount()
  })

  it('屏幕比默认值窄时，已经排满就不显示按钮', () => {
    const wrapper = mountRange({ value: 800, max: 800, defaultValue: 900 })

    expect(wrapper.find(button).classes()).toContain('invisible')
    wrapper.unmount()
  })

  it('屏幕比默认值窄时，写回的仍是真正的默认值', async () => {
    const wrapper = mountRange({ value: 600, max: 800, defaultValue: 900 })

    await wrapper.find(button).trigger('click')

    expect(wrapper.emitted('change')).toEqual([[900]])
    wrapper.unmount()
  })

  it('没有默认值的滑块不出现按钮', () => {
    const wrapper = mountRange({ value: 18 })

    expect(wrapper.find(button).exists()).toBe(false)
    wrapper.unmount()
  })
})
