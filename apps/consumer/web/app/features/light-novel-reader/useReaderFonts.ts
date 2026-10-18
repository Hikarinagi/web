import { cachedFont, fontCatalogue, loadFont, type ReaderFont } from './fonts'
import type { ReaderFontId } from './settings'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderSettings } from './useReaderSettings'

export function useReaderFonts(engine: ReaderEngine, settings: ReaderSettings) {
  const catalogue = shallowRef<ReaderFont[]>([])
  const ready = ref(new Set<string>())
  const pending = ref<{ id: string; progress: number } | null>(null)
  const failed = ref(false)
  let abort: AbortController | null = null

  watch(engine.font, font => {
    if (font && !ready.value.has(font.id)) ready.value = new Set([...ready.value, font.id])
  })

  async function refresh() {
    try {
      const fonts = await fontCatalogue()
      const cached = await Promise.all(fonts.map(font => cachedFont(font.sha256)))
      catalogue.value = fonts
      ready.value = new Set(fonts.filter((_, index) => cached[index]).map(font => font.id))
    } catch {
      catalogue.value = []
    }
  }

  async function choose(id: ReaderFontId) {
    abort?.abort()
    abort = null
    pending.value = null
    failed.value = false
    if (engine.font.value?.id === id) {
      settings.setFont(id)
      return
    }
    if (!catalogue.value.length) await refresh()
    const font = catalogue.value.find(item => item.id === id)
    if (!font) return
    const controller = new AbortController()
    abort = controller
    if (!ready.value.has(id)) pending.value = { id, progress: 0 }
    try {
      const bytes = await loadFont(font, {
        signal: controller.signal,
        onProgress: ({ loaded }) => {
          if (abort === controller) pending.value = { id, progress: loaded / font.bytes }
        },
      })
      if (abort !== controller) return
      ready.value = new Set([...ready.value, id])
      pending.value = null
      await engine.swapFont(font, bytes)
      settings.setFont(id)
    } catch {
      if (abort !== controller) return
      pending.value = null
      failed.value = true
    } finally {
      if (abort === controller) abort = null
    }
  }

  return { catalogue, ready, pending, failed, refresh, choose }
}

export type ReaderFonts = ReturnType<typeof useReaderFonts>
