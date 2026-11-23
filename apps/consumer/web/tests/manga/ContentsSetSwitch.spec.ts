import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SetSwitch from '../../app/components/manga/contents/SetSwitch.vue'
import type { ContentsSetOption } from '~/features/manga/sets'

const original: ContentsSetOption = {
  value: 69,
  label: 'ジャンプコミックス 31 卷',
  key: 0,
  original: true,
}
const reissue: ContentsSetOption = { value: 70, label: '完全版 24 卷', key: 70, original: false }

describe('MangaContentsSetSwitch', () => {
  it('switches between the sets that have volumes to read, named 版本', async () => {
    const wrapper = mount(SetSwitch, {
      props: {
        options: [original, reissue],
        modelValue: 69,
        'onUpdate:modelValue': (value: number | null) => wrapper.setProps({ modelValue: value }),
      },
    })
    const group = wrapper.get('[role="group"]')
    expect(group.attributes('aria-label')).toBe('版本')
    expect(group.text()).toContain('ジャンプコミックス 31 卷')
    expect(group.text()).toContain('完全版 24 卷')
    const button = wrapper.findAll('button').find(item => item.text() === '完全版 24 卷')!
    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([70])
  })

  it('names the only set to read when it is not the original, without a switch', () => {
    const wrapper = mount(SetSwitch, { props: { options: [reissue], modelValue: 70 } })
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    expect(wrapper.text()).toBe('版本完全版 24 卷')
  })

  it('shows nothing when the only set to read is the original', () => {
    const wrapper = mount(SetSwitch, { props: { options: [original], modelValue: 69 } })
    expect(wrapper.text()).toBe('')
  })
})
