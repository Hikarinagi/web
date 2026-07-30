import { computed, nextTick, onBeforeUnmount, ref, type Ref } from 'vue'

interface AnchorPosition {
  x: number
  y: number
}

const VIEWPORT_PADDING = 8

export function useReaderContextMenu(menuRef: Ref<HTMLElement | null>) {
  const open = ref(false)
  const anchor = ref<AnchorPosition>({ x: 0, y: 0 })
  const visible = computed(() => open.value)

  async function show(event: MouseEvent) {
    event.preventDefault()
    const cursorX = event.clientX
    const cursorY = event.clientY
    anchor.value = { x: cursorX, y: cursorY }
    open.value = true

    await nextTick()
    const el = menuRef.value
    if (!el) return
    const w = el.offsetWidth
    const h = el.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    const flipX = cursorX + w + VIEWPORT_PADDING > vw
    const flipY = cursorY + h + VIEWPORT_PADDING > vh
    anchor.value = {
      x: flipX ? Math.max(VIEWPORT_PADDING, cursorX - w) : cursorX,
      y: flipY ? Math.max(VIEWPORT_PADDING, cursorY - h) : cursorY,
    }
  }

  function dismiss() {
    open.value = false
  }

  function handleOutsidePointer(target: EventTarget | null) {
    if (!open.value) return
    if (!(target instanceof HTMLElement)) return
    if (target.closest('[data-reader-context-menu]')) return
    dismiss()
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && open.value) dismiss()
  }

  if (import.meta.client) {
    window.addEventListener('keydown', handleEscape)
  }

  onBeforeUnmount(() => {
    if (import.meta.client) window.removeEventListener('keydown', handleEscape)
  })

  return {
    anchor,
    visible,
    show,
    dismiss,
    handleOutsidePointer,
  }
}
