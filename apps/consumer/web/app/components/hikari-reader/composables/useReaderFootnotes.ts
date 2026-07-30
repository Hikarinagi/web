import type { ReaderController, ReaderControllerEvents } from '@ritojs/kit'
import { onBeforeUnmount, onMounted, shallowRef, watch, type Ref, type ShallowRef } from 'vue'

type FootnoteClickEvent = ReaderControllerEvents['footnoteClick']

export interface ReaderFootnote {
  id: string
  href: string
  kind: FootnoteClickEvent['content']['kind']
  text: string
}

interface UseReaderFootnotesOptions {
  controller: ShallowRef<ReaderController | null>
  currentSpread: Ref<number>
  suppressTap?: () => void
}

function textFor(content: FootnoteClickEvent['content']) {
  return content.text.trim()
}

export function useReaderFootnotes(options: UseReaderFootnotesOptions) {
  const active = shallowRef<ReaderFootnote | null>(null)
  let unsubscribe: (() => void) | null = null

  function dismiss() {
    active.value = null
  }

  function handleOutsidePointer(target: EventTarget | null) {
    if (!active.value) return false
    if (!(target instanceof HTMLElement)) return false
    if (target.closest('[data-reader-footnote-panel]')) return false
    active.value = null
    return true
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') dismiss()
  }

  function detach() {
    unsubscribe?.()
    unsubscribe = null
    dismiss()
  }

  function attach(controller: ReaderController) {
    detach()
    unsubscribe = controller.on('footnoteClick', ({ id, href, content }) => {
      options.suppressTap?.()
      active.value = {
        id,
        href,
        kind: content.kind,
        text: textFor(content),
      }
    })
  }

  watch(
    () => options.controller.value,
    controller => {
      if (controller) attach(controller)
      else detach()
    },
    { immediate: true },
  )

  watch(() => options.currentSpread.value, dismiss)

  onMounted(() => {
    window.addEventListener('keydown', handleEscape)
  })

  onBeforeUnmount(() => {
    detach()
    window.removeEventListener('keydown', handleEscape)
  })

  return {
    active,
    dismiss,
    handleOutsidePointer,
  }
}
