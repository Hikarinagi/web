import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Picker from '../../app/components/contribute/upload/Picker.vue'
import type { IntakeVolume } from '~/features/contribute/useNovelIntake'

const suggestion = (set: IntakeVolume['volume_set']) =>
  ({
    id: 12,
    name: '涼宮ハルヒの溜息',
    name_cn: null,
    volume_type: 'MAIN',
    volume_number: 2,
    volume_label: '2',
    publication_date: null,
    publication_date_precision: null,
    covers: [],
    display_cover: null,
    series: { id: 3, name: '涼宮ハルヒの憂鬱', name_cn: '凉宫春日的忧郁', nsfw: false },
    has_epub: false,
    volume_set: set,
  }) as IntakeVolume

describe('ContributeUploadPicker', () => {
  it('names the set of a suggested volume of another set and hands it over on confirm', async () => {
    const volume = suggestion({ id: 61, name: '新装版', original: false })
    const wrapper = mount(Picker, { props: { filename: 'haruhi-2.epub', suggestion: volume } })
    expect(wrapper.text()).toContain('可能为「凉宫春日的忧郁 新装版 第 2 卷」')
    const confirm = wrapper.findAll('button').find(button => button.text() === '确认')!
    await confirm.trigger('click')
    expect(wrapper.emitted('pick')?.[0]).toEqual([volume])
  })

  it('leaves a suggested volume of the original set bare', () => {
    const wrapper = mount(Picker, {
      props: {
        filename: 'haruhi-2.epub',
        suggestion: suggestion({ id: 60, name: '角川スニーカー文庫', original: true }),
      },
    })
    expect(wrapper.text()).toContain('可能为「凉宫春日的忧郁 第 2 卷」')
  })
})
