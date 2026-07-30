import { ref } from 'vue'

const SHOW_DELAY_MS = 300
const HIDE_DELAY_MS = 160

export function useEmojiHoverCard() {
  const visible = ref(false)

  const {
    start: scheduleShow,
    stop: cancelShow,
    isPending: showPending,
  } = useTimeoutFn(
    () => {
      visible.value = true
    },
    SHOW_DELAY_MS,
    { immediate: false },
  )

  const {
    start: scheduleHide,
    stop: cancelHide,
    isPending: hidePending,
  } = useTimeoutFn(
    () => {
      visible.value = false
    },
    HIDE_DELAY_MS,
    { immediate: false },
  )

  function requestShow() {
    cancelHide()
    if (visible.value || showPending.value) return
    scheduleShow()
  }

  function showNow() {
    cancelShow()
    cancelHide()
    visible.value = true
  }

  function requestHide() {
    cancelShow()
    if (!visible.value || hidePending.value) return
    scheduleHide()
  }

  return { visible, requestShow, showNow, requestHide, cancelHide }
}
