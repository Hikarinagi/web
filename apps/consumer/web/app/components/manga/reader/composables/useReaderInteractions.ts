import type { Ref } from 'vue'

interface UseReaderInteractionsOptions {
  educationVisible: Ref<boolean>
  next: () => void
  previous: () => void
  hideChrome: () => void
  toggleChrome: () => void
}

export function useReaderInteractions(options: UseReaderInteractionsOptions) {
  let lastPointerType = 'mouse'

  function onChromeIntent() {
    if (options.educationVisible.value) return
    options.toggleChrome()
  }

  /**
   * A touch long-press raises `contextmenu` on Android. The mobile reader does
   * nothing on long-press, so neither do we — right-click stays a pointer-only
   * shortcut.
   */
  function onContextMenu(event: Event) {
    event.preventDefault()
    if (lastPointerType === 'touch') return
    onChromeIntent()
  }

  function onKeydown(event: KeyboardEvent) {
    const target = event.target
    if (target instanceof HTMLElement) {
      const tag = target.tagName.toLowerCase()
      if (target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select')
        return
    }
    if (options.educationVisible.value) return
    if (event.key === 'ArrowLeft') options.next()
    else if (event.key === 'ArrowRight') options.previous()
    else if (event.key === 'Escape') options.hideChrome()
  }

  useEventListener(window, 'keydown', onKeydown)
  useEventListener(
    window,
    'pointerdown',
    (event: PointerEvent) => (lastPointerType = event.pointerType),
    { capture: true },
  )

  return { onChromeIntent, onContextMenu }
}
