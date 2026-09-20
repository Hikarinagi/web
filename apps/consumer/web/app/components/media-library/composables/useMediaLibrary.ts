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
let resolver: ((result: MediaValue[]) => void) | null = null

export function useMediaLibrary() {
  function open(options: MediaLibraryOpenOptions = {}): Promise<MediaValue[]> {
    mode.value = options.mode ?? 'single'
    max.value = mode.value === 'single' ? 1 : options.max
    style.value = options.style ?? 'dialog'
    anchor.value = options.anchor ?? null
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

  return { visible, mode, max, style, anchor, open, finish }
}
