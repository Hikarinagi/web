import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BottomBar from '~/components/manga/reader/BottomBar.vue'
import ProgressScrubber from '~/components/manga/reader/ProgressScrubber.vue'

function mountBar(total: number) {
  return mount(BottomBar, {
    props: {
      total,
      filled: 1,
      layout: 'single' as const,
      fit: 'width' as const,
      canGoNext: true,
      canGoPrevious: false,
      showLayoutControls: true,
    },
    global: { components: { MangaReaderProgressScrubber: ProgressScrubber } },
  })
}

describe('MangaReaderBottomBar', () => {
  it('单页漫画不摆进度条，没有可拖的东西', () => {
    expect(mountBar(1).findComponent(ProgressScrubber).exists()).toBe(false)
  })

  it('多页时才摆出进度条', () => {
    expect(mountBar(20).findComponent(ProgressScrubber).exists()).toBe(true)
  })

  it('双页布局下进度条按两页一档走', () => {
    const wrapper = mount(BottomBar, {
      props: {
        total: 20,
        filled: 1,
        layout: 'double' as const,
        fit: 'width' as const,
        canGoNext: true,
        canGoPrevious: false,
        showLayoutControls: true,
      },
      global: { components: { MangaReaderProgressScrubber: ProgressScrubber } },
    })
    expect(wrapper.findComponent(ProgressScrubber).props('step')).toBe(2)
  })
})
