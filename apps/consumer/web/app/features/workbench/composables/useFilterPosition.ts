import type { VirtualListExpose } from '@hina-ui/vue'
import type { useTranslationEditor } from './useTranslationEditor'

type Editor = ReturnType<typeof useTranslationEditor>

export function useFilterPosition(
  editor: Editor,
  list: Readonly<Ref<VirtualListExpose | null>>,
  chapterId: () => number,
) {
  const { filter, visible, numbers, activeId } = editor
  const anchors = new Map<string, string>()

  function topSegment() {
    const viewport = list.value?.viewport
    if (!viewport) return null
    const top = viewport.getBoundingClientRect().top
    const row = [...viewport.querySelectorAll<HTMLElement>('[data-segment-row]')].find(
      element => element.getBoundingClientRect().bottom > top + 1,
    )
    return row?.dataset.segmentRow ?? null
  }

  function indexOf(target: string | null) {
    if (!target) return 0
    const exact = visible.value.findIndex(segment => segment.id === target)
    if (exact >= 0) return exact
    const number = numbers.value.get(target) ?? -1
    return Math.max(
      visible.value.findIndex(segment => (numbers.value.get(segment.id) ?? -1) >= number),
      0,
    )
  }

  watch(filter, async (next, previous) => {
    const current = topSegment()
    if (current) anchors.set(`${chapterId()}:${previous}`, current)
    await nextTick()
    const target = anchors.get(`${chapterId()}:${next}`) ?? activeId.value
    list.value?.scrollToIndex(indexOf(target), { align: 'start' })
  })
}
