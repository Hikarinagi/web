import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import ProgressScrubber from '~/components/manga/reader/ProgressScrubber.vue'

/** Captures what the real PrimeVue Slider would have received. */
const SliderStub = defineComponent({
  name: 'Slider',
  props: { modelValue: { type: Number, default: 0 }, min: Number, max: Number },
  emits: ['change', 'slideend'],
  template: '<div class="slider-stub" />',
})

function mountScrubber(props: { total: number; filled: number }) {
  return mount(ProgressScrubber, {
    props,
    global: { stubs: { Slider: SliderStub } },
  })
}

describe('MangaReaderProgressScrubber', () => {
  it('runs the track right-to-left so it matches the stage', () => {
    const wrapper = mountScrubber({ total: 20, filled: 3 })
    // Slider derives RTL from the computed direction; without this the range
    // fills from the left and the bar reads backwards.
    expect(wrapper.find('.slider-stub').attributes('dir')).toBe('rtl')
  })

  it('binds the real page number rather than a mirrored one', () => {
    // Mirroring by hand puts page 1 at a full bar and the last page at an
    // empty one, because the range width is driven by the bound value.
    const slider = mountScrubber({ total: 20, filled: 1 }).findComponent(SliderStub)
    expect(slider.props('modelValue')).toBe(1)
    expect(slider.props('min')).toBe(1)
    expect(slider.props('max')).toBe(20)

    const late = mountScrubber({ total: 20, filled: 20 }).findComponent(SliderStub)
    expect(late.props('modelValue')).toBe(20)
  })

  it('shows the scrubbed page while dragging and jumps once on release', async () => {
    const wrapper = mountScrubber({ total: 20, filled: 3 })
    const slider = wrapper.findComponent(SliderStub)

    await slider.vm.$emit('change', 12)
    expect(wrapper.text()).toContain('12 / 20')
    expect(wrapper.emitted('jump')).toBeUndefined()

    await slider.vm.$emit('slideend')
    expect(wrapper.emitted('jump')).toEqual([[12]])
  })

  it('does not re-jump when the scrub lands on the current page', async () => {
    const wrapper = mountScrubber({ total: 20, filled: 3 })
    const slider = wrapper.findComponent(SliderStub)
    await slider.vm.$emit('change', 3)
    await slider.vm.$emit('slideend')
    expect(wrapper.emitted('jump')).toBeUndefined()
  })

  it('stays out of the way when there is nothing to scrub', () => {
    expect(mountScrubber({ total: 1, filled: 1 }).find('.slider-stub').exists()).toBe(false)
  })
})
