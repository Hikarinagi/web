interface UseReaderChromeOptions {
  panelOpen: () => boolean
}

export function useReaderChrome(options: UseReaderChromeOptions) {
  const visible = ref(true)

  function show() {
    visible.value = true
  }

  function hide() {
    if (options.panelOpen()) return
    visible.value = false
  }

  function toggle() {
    if (visible.value) hide()
    else show()
  }

  return { visible, show, hide, toggle }
}
