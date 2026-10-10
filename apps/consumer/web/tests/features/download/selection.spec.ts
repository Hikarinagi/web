import { mount, flushPromises } from '@vue/test-utils'
import { Combobox, SearchInput, SegmentedControl } from '@hina-ui/vue'
import { defineComponent, type PropType } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NovelAction from '../../../app/components/light-novel-volume/download/Action.vue'
import MangaAction from '../../../app/components/manga/download/Action.vue'
import Selection from '../../../app/components/download/Selection.vue'
import type { useDownloadDialog } from '../../../app/features/download/useDownloadDialog'

const Dialog = defineComponent({
  inheritAttrs: false,
  props: {
    flow: { type: Object as PropType<ReturnType<typeof useDownloadDialog>>, required: true },
  },
  template: '<slot v-if="flow.open.value" />',
})
const Trigger = defineComponent({ template: '<button />' })

describe.each([
  ['novel', NovelAction],
  ['manga', MangaAction],
] as const)('%s download selection lifetime', (name, Action) => {
  afterEach(() => vi.unstubAllGlobals())

  it('preserves range, search and custom choices when the dialog body unmounts', async () => {
    vi.stubGlobal(
      'hikariRequest',
      vi.fn(async () => ({
        kind: name === 'novel' ? 'NOVEL' : 'MANGA',
        series_id: 9,
        format: name === 'novel' ? 'EPUB' : 'CBZ',
        title: '作品',
        items: [],
        files: [],
        total_bytes: 0,
        new_bytes: 0,
        required_cards: 0,
        blocked: null,
        cards: {
          available: 3,
          purchased: 3,
          price: 6,
          points: 82,
          novel_count: 0,
          manga_count: 0,
          cards_used: 0,
          novel_band_size: 3,
          manga_band_size: 30,
        },
        limits: {
          parallel_connections: 6,
          file_max_bytes: 1,
          daily_limit_bytes: 1,
          daily_used_bytes: 0,
          memory_fallback_max_bytes: 1,
        },
      })),
    )
    const wrapper = mount(Action, {
      props:
        name === 'novel'
          ? {
              seriesId: 9,
              title: '作品',
              volumes: [1, 2, 3].map(id => ({ id, label: `第 ${id} 卷` })),
            }
          : {
              id: 9,
              title: '作品',
              chapters: [1, 2, 3].map(id => ({
                id,
                readable: true,
                sort_key: id,
                chapter_number: id,
                title: `第 ${id} 话`,
              })),
            },
      global: {
        components: {
          DownloadDialog: Dialog,
          DownloadTrigger: Trigger,
          DownloadSelection: Selection,
        },
      },
    })
    const flow = () => wrapper.findComponent(Dialog).props('flow')
    try {
      await wrapper.findComponent(Trigger).trigger('click')
      await flushPromises()
      wrapper.findComponent(SegmentedControl).vm.$emit('update:modelValue', 'range')
      await flushPromises()
      wrapper.findAllComponents(Combobox)[0]!.vm.$emit('update:modelValue', 2)
      await flushPromises()
      expect(wrapper.findComponent(Selection).props('modelValue')).toEqual([2, 3])

      flow().open.value = false
      await flushPromises()
      expect(wrapper.findComponent(Selection).exists()).toBe(false)
      await wrapper.findComponent(Trigger).trigger('click')
      await flushPromises()
      expect(wrapper.findComponent(SegmentedControl).props('modelValue')).toBe('range')
      expect(wrapper.findAllComponents(Combobox)[0]!.props('modelValue')).toBe(2)
      expect(wrapper.findComponent(Selection).props('modelValue')).toEqual([2, 3])

      wrapper.findComponent(SegmentedControl).vm.$emit('update:modelValue', 'custom')
      await flushPromises()
      wrapper.findComponent(SearchInput).vm.$emit('update:modelValue', '2')
      wrapper.findComponent(Selection).vm.$emit('update:modelValue', [2])
      await flushPromises()
      flow().open.value = false
      await flushPromises()
      await wrapper.findComponent(Trigger).trigger('click')
      await flushPromises()
      expect(wrapper.findComponent(SegmentedControl).props('modelValue')).toBe('custom')
      expect(wrapper.findComponent(SearchInput).props('modelValue')).toBe('2')
      expect(wrapper.findComponent(Selection).props('modelValue')).toEqual([2])
    } finally {
      wrapper.unmount()
    }
  })
})
