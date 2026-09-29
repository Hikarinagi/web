import type { InjectionKey } from 'vue'
import type { useMangaRegions } from './useMangaRegions'
import type { useMangaTranslations } from './useMangaTranslations'

export type MangaEditorContext = {
  store: ReturnType<typeof useMangaRegions>
  translations: ReturnType<typeof useMangaTranslations>
}

export const MANGA_EDITOR: InjectionKey<MangaEditorContext> = Symbol('manga-editor')

export function useMangaEditor() {
  const context = inject(MANGA_EDITOR)
  if (!context) throw new Error('useMangaEditor() must be used inside the manga editor')
  return context
}
