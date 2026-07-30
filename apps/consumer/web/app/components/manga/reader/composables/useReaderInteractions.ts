import type { Ref } from 'vue'

interface UseReaderInteractionsOptions {
  educationVisible: Ref<boolean>
  next: () => void
  previous: () => void
  hideChrome: () => void
  toggleChrome: () => void
}

export function useReaderInteractions(options: UseReaderInteractionsOptions) {
  function onChromeIntent() {
    if (options.educationVisible.value) return
    options.toggleChrome()
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

  return { onChromeIntent }
}
