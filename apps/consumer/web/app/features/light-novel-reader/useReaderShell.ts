import { useMediaQuery } from '@vueuse/core'

export type ReaderPanel = 'settings'

const WIDTH = { min: 240, max: 400, left: 272, right: 320 } as const

export function useReaderShell() {
  const wide = useMediaQuery('(min-width: 1440px)')
  const medium = useMediaQuery('(min-width: 1024px)')
  const phone = useMediaQuery('(max-width: 639.98px)')
  const stored = useLocalStorage(
    'hikari:light-novel-reader:shell',
    {
      left: true,
      right: null as ReaderPanel | null,
      leftWidth: WIDTH.left,
      rightWidth: WIDTH.right,
    },
    { mergeDefaults: true },
  )
  const drawer = ref<'left' | ReaderPanel | null>(null)
  const sheet = ref<'toc' | ReaderPanel | null>(null)
  const chrome = ref(true)
  const dock = ref(0)
  const tab = ref('toc')
  const volumes = ref(false)

  const leftDocked = computed(() => medium.value && stored.value.left)
  const rightDocked = computed(() => (wide.value ? stored.value.right : null))

  watch([medium, wide, phone], () => {
    drawer.value = null
    sheet.value = null
  })

  function toggleLeft() {
    if (medium.value) stored.value = { ...stored.value, left: !stored.value.left }
    else drawer.value = drawer.value === 'left' ? null : 'left'
  }

  function togglePanel(panel: ReaderPanel) {
    if (wide.value) {
      const shown = rightDocked.value === panel
      stored.value = { ...stored.value, right: shown ? null : panel }
    } else {
      drawer.value = drawer.value === panel ? null : panel
    }
  }

  function settle() {
    sheet.value = null
    if (!leftDocked.value) drawer.value = null
  }

  function resize(side: 'left' | 'right', width: number | null) {
    const value =
      width == null ? WIDTH[side] : Math.round(Math.min(WIDTH.max, Math.max(WIDTH.min, width)))
    stored.value = { ...stored.value, [side === 'left' ? 'leftWidth' : 'rightWidth']: value }
  }

  return {
    phone,
    medium,
    wide,
    stored,
    drawer,
    sheet,
    chrome,
    dock,
    tab,
    volumes,
    leftDocked,
    rightDocked,
    toggleLeft,
    togglePanel,
    settle,
    resize,
  }
}

export type ReaderShell = ReturnType<typeof useReaderShell>
