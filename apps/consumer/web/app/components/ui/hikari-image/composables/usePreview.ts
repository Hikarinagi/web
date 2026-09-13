import type { InjectionKey, Ref } from 'vue'
import type { HikariImageProcessing } from '~/utils/media/image'

export interface HikariImagePreviewItem {
  id: string
  displaySrc: string
  originalSrc: string
  alt: string
  processing?: HikariImageProcessing
  naturalWidth?: number
  naturalHeight?: number
}

type PreviewState = {
  open: boolean
  items: HikariImagePreviewItem[]
  index: number
}

interface HikariImageGroupContext {
  register: (item: HikariImagePreviewItem) => void
  unregister: (id: string) => void
  open: (id: string) => void
}

export const HIKARI_IMAGE_GROUP_KEY: InjectionKey<HikariImageGroupContext> =
  Symbol('hikari-image-group')

const STATE_KEY = 'hikari-image-preview'

function usePreviewState(): Ref<PreviewState> {
  return useState<PreviewState>(STATE_KEY, () => ({ open: false, items: [], index: 0 }))
}

export function useHikariImagePreview() {
  const state = usePreviewState()

  const isOpen = computed(() => state.value.open)
  const items = computed(() => state.value.items)
  const index = computed(() => state.value.index)
  const current = computed<HikariImagePreviewItem | null>(
    () => state.value.items[state.value.index] ?? null,
  )
  const hasMultiple = computed(() => state.value.items.length > 1)

  function open(items: HikariImagePreviewItem[], index = 0) {
    if (!items.length) return
    state.value = {
      open: true,
      items,
      index: Math.min(Math.max(index, 0), items.length - 1),
    }
  }

  function close() {
    if (!state.value.open) return
    state.value = { ...state.value, open: false }
  }

  function goTo(next: number) {
    const total = state.value.items.length
    if (!total) return
    const clamped = ((next % total) + total) % total
    if (clamped === state.value.index) return
    state.value = { ...state.value, index: clamped }
  }

  function next() {
    goTo(state.value.index + 1)
  }

  function prev() {
    goTo(state.value.index - 1)
  }

  return {
    isOpen,
    items,
    index,
    current,
    hasMultiple,
    open,
    close,
    next,
    prev,
    goTo,
  }
}
