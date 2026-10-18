import type { ReaderShell } from './useReaderShell'

export function useReaderTour(options: { shell: ReaderShell; ready: () => boolean }) {
  const { drawer, sheet, chrome } = options.shell
  const seen = useLocalStorage('hikari:light-novel-reader:tour', false)
  const open = ref(false)
  const step = ref(1)

  function start() {
    drawer.value = null
    sheet.value = null
    chrome.value = true
    step.value = 1
    open.value = true
  }

  watch(
    () => options.ready() && !seen.value && !open.value && !drawer.value && !sheet.value,
    due => {
      if (due) start()
    },
    { immediate: true },
  )
  watch(open, value => {
    if (!value) seen.value = true
  })

  return { open, step, start }
}

export type ReaderTour = ReturnType<typeof useReaderTour>
