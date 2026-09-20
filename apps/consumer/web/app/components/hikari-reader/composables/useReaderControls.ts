import type { ReaderController } from '@ritojs/kit'
import type { Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface UseReaderControlsOptions {
  controller: Ref<ReaderController | null>
  loaded: Ref<boolean>
  panelOpen: () => boolean
  closePanels: () => void
}

const TRANSIENT_HIDE_DELAY = 3600
const INTRO_HIDE_DELAY = 4200

type Mode = 'hidden' | 'transient'

export function useReaderControls(options: UseReaderControlsOptions) {
  const mode = ref<Mode>('hidden')
  const visible = computed(() => mode.value !== 'hidden')
  const isCoarsePointer = ref(false)
  let hideTimer: number | null = null
  let hideDelay = TRANSIENT_HIDE_DELAY
  let coarseQuery: MediaQueryList | null = null

  function clearHideTimer() {
    if (hideTimer === null) return
    window.clearTimeout(hideTimer)
    hideTimer = null
  }

  function scheduleHide(delay: number) {
    clearHideTimer()
    hideDelay = delay
    hideTimer = window.setTimeout(() => {
      hideTimer = null
      if (mode.value === 'transient') mode.value = 'hidden'
    }, delay)
  }

  function pauseTimer() {
    clearHideTimer()
  }

  function resumeTimer() {
    if (mode.value !== 'transient') return
    scheduleHide(hideDelay)
  }

  function showTransient(delay = TRANSIENT_HIDE_DELAY) {
    mode.value = 'transient'
    scheduleHide(delay)
  }

  function showIntro() {
    showTransient(INTRO_HIDE_DELAY)
  }

  function hide() {
    clearHideTimer()
    mode.value = 'hidden'
  }

  function toggle() {
    if (mode.value === 'hidden') showTransient()
    else hide()
  }

  function handleOutsidePointer(target: EventTarget | null) {
    if (mode.value === 'hidden') return
    if (!(target instanceof HTMLElement)) return
    if (target.closest('[data-reader-ui]')) return
    if (target.closest('[data-reader-context-menu]')) return
    hide()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (isEditableTarget(event.target)) return

    if (event.key === 'Escape') {
      if (options.panelOpen()) options.closePanels()
      else hide()
    }
  }

  function syncKeyboard() {
    options.controller.value?.keyboard.setEnabled(!options.panelOpen())
  }

  watch(
    () => options.panelOpen(),
    () => syncKeyboard(),
  )

  watch(
    () => options.controller.value,
    () => syncKeyboard(),
  )

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    if ('matchMedia' in window) {
      coarseQuery = window.matchMedia('(pointer: coarse)')
      isCoarsePointer.value = coarseQuery.matches
      coarseQuery.addEventListener('change', handleCoarseChange)
    }
  })

  function handleCoarseChange(event: MediaQueryListEvent) {
    isCoarsePointer.value = event.matches
  }

  onBeforeUnmount(() => {
    clearHideTimer()
    options.controller.value?.keyboard.setEnabled(true)
    window.removeEventListener('keydown', handleKeydown)
    coarseQuery?.removeEventListener('change', handleCoarseChange)
    coarseQuery = null
  })

  return {
    mode,
    visible,
    isCoarsePointer,
    showTransient,
    showIntro,
    hide,
    toggle,
    handleOutsidePointer,
    pauseTimer,
    resumeTimer,
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  const tagName = target.tagName.toLowerCase()
  return (
    target.isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select'
  )
}
