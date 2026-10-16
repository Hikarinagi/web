import type { Ref } from 'vue'
import type { MangaReaderDirection } from '../lib/settings'

interface UseReaderInteractionsOptions {
  educationVisible: Ref<boolean>
  paged: () => boolean
  tapSides: () => boolean
  direction: () => MangaReaderDirection
  next: () => void
  previous: () => void
  showChrome: () => void
  hideChrome: () => void
  toggleChrome: () => void
}

const SIDE_RATIO = 1 / 3

export function useReaderInteractions(options: UseReaderInteractionsOptions) {
  function turn(side: 'left' | 'right') {
    const forward = options.direction() === 'rtl' ? 'left' : 'right'
    if (side === forward) options.next()
    else options.previous()
  }

  function onTap(event: MouseEvent) {
    if (options.educationVisible.value) return
    if (options.paged() && options.tapSides()) {
      const ratio = event.clientX / window.innerWidth
      if (ratio < SIDE_RATIO) return turn('left')
      if (ratio > 1 - SIDE_RATIO) return turn('right')
    }
    options.toggleChrome()
  }

  function onContextMenu(event: Event) {
    event.preventDefault()
    if (options.educationVisible.value) return
    options.showChrome()
  }

  function onKeydown(event: KeyboardEvent) {
    const target = event.target
    if (target instanceof HTMLElement) {
      const tag = target.tagName.toLowerCase()
      if (target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select')
        return
    }
    if (options.educationVisible.value) return
    if (event.key === 'Escape') {
      options.hideChrome()
      return
    }
    if (!options.paged()) return
    if (event.key === 'ArrowLeft') turn('left')
    else if (event.key === 'ArrowRight') turn('right')
    else if (event.key === 'PageDown' || event.key === ' ') options.next()
    else if (event.key === 'PageUp') options.previous()
    else return
    event.preventDefault()
  }

  useEventListener(window, 'keydown', onKeydown)

  return { onTap, onContextMenu }
}
