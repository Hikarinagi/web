import { Checkbox } from '@hina-ui/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import GalgameRateDialog from '../../app/components/galgame/rate/Dialog.vue'
import LightNovelRateDialog from '../../app/components/light-novel/rate/Dialog.vue'
import MangaRateDialog from '../../app/components/manga/rate/Dialog.vue'

const rate = {
  status: 'GOING',
  rate: 8,
  rate_content: '第二章开始渐入佳境',
  is_spoiler: true,
  status_private: true,
  time_to_finish_minutes: null,
}

const shared = {
  rate,
  workTitle: '测试作品',
  upsert: () => Promise.resolve(null),
  remove: () => Promise.resolve(),
}

describe.each([
  ['Galgame', GalgameRateDialog, { galgameId: 1 }],
  ['轻小说', LightNovelRateDialog, { lightNovelId: 1 }],
  ['漫画', MangaRateDialog, {}],
] as const)('%s状态弹窗', (_, Dialog, extra) => {
  it('挂载时就已打开，也要用已有状态填好表单', async () => {
    const wrapper = mount(Dialog as never, {
      props: { ...shared, ...extra, visible: true },
      global: {
        stubs: {
          HnDialog: defineComponent({
            setup:
              (_props, { slots }) =>
              () =>
                h('section', [slots.content?.(), slots.footer?.()]),
          }),
        },
      },
    })
    await flushPromises()

    expect(wrapper.get('textarea').element.value).toBe('第二章开始渐入佳境')
    expect(wrapper.findAllComponents(Checkbox).map(box => box.props('modelValue'))).toEqual([
      true,
      true,
    ])
    wrapper.unmount()
  })
})
