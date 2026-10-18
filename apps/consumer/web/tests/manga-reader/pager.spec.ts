import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Pager from '~/components/manga/reader/bar/Pager.vue'

vi.mock('@hina-ui/vue', async importOriginal => {
  const { defineComponent } = await import('vue')
  return {
    ...(await importOriginal<typeof import('@hina-ui/vue')>()),
    Slider: defineComponent({
      name: 'Slider',
      props: { modelValue: { type: Number, default: 0 }, min: Number, max: Number, dir: String },
      emits: ['update:modelValue', 'commit'],
      template: '<div class="slider-stub" :data-dir="dir" />',
    }),
    Popover: defineComponent({
      name: 'Popover',
      template: '<div><slot /></div>',
    }),
  }
})

const pages = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  page_number: index + 1,
  width: 800,
  height: 1200,
  mime_type: 'image/webp',
}))

function mountPager(props: Partial<{ shown: number[]; direction: 'rtl' | 'ltr' }> = {}) {
  return mount(Pager, {
    props: {
      pages,
      shown: [3],
      direction: 'rtl' as const,
      spreadOf: (page: number) => [page],
      statusOf: () => 'idle' as const,
      imageOf: () => null,
      dark: true,
      ...props,
    },
    global: { stubs: { MangaReaderThumb: true } },
  })
}

const sliderOf = (wrapper: ReturnType<typeof mountPager>) =>
  wrapper.findComponent({ name: 'Slider' })

describe('MangaReaderPager', () => {
  it('runs the track in the reading direction', () => {
    expect(mountPager().find('.slider-stub').attributes('data-dir')).toBe('rtl')
    expect(mountPager({ direction: 'ltr' }).find('.slider-stub').attributes('data-dir')).toBe('ltr')
  })

  it('binds the real page number and names a spread by its pages', () => {
    const wrapper = mountPager({ shown: [6, 7] })
    expect(sliderOf(wrapper).props('modelValue')).toBe(7)
    expect(wrapper.text()).toContain('6–7 / 20')
  })

  it('previews the dragged page and jumps once on release', async () => {
    const wrapper = mountPager()
    const slider = sliderOf(wrapper)
    await slider.vm.$emit('update:modelValue', 12)
    expect(wrapper.text()).toContain('第 12 页')
    expect(wrapper.emitted('peek')).toEqual([[[12]]])
    expect(wrapper.emitted('jump')).toBeUndefined()
    await slider.vm.$emit('commit')
    expect(wrapper.emitted('jump')).toEqual([[12]])
  })

  it('does not jump when the drag lands on the current page', async () => {
    const wrapper = mountPager()
    const slider = sliderOf(wrapper)
    await slider.vm.$emit('update:modelValue', 3)
    await slider.vm.$emit('commit')
    expect(wrapper.emitted('jump')).toBeUndefined()
  })
})
