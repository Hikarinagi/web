import type {
  MediaLibraryMode,
  MediaLibraryOpenOptions,
  MediaLibraryStyle,
  MediaValue,
} from '../types'

const visible = ref(false)
const mode = ref<MediaLibraryMode>('single')
const max = ref<number | undefined>(1)
const style = ref<MediaLibraryStyle>('dialog')
const anchor = ref<HTMLElement | null>(null)
const selected = ref<MediaValue[]>([])
let resolver: ((result: MediaValue[]) => void) | null = null

export function useMediaLibrary() {
  const confirmLabel = computed(() =>
    selected.value.length ? `添加 ${selected.value.length} 张` : '添加',
  )

  function open(options: MediaLibraryOpenOptions = {}): Promise<MediaValue[]> {
    mode.value = options.mode ?? 'single'
    max.value = mode.value === 'single' ? 1 : options.max
    style.value = options.style ?? 'dialog'
    anchor.value = options.anchor ?? null
    selected.value = []
    visible.value = true
    return new Promise(resolve => {
      resolver = resolve
    })
  }

  function finish(result: MediaValue[]) {
    visible.value = false
    resolver?.(result)
    resolver = null
    anchor.value = null
  }

  return { visible, mode, max, style, anchor, selected, confirmLabel, open, finish }
}
