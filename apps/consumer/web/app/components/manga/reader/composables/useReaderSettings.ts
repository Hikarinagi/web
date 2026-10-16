import {
  MANGA_READER_DEFAULT_SETTINGS,
  MANGA_READER_DIRECTIONS_KEY,
  MANGA_READER_MODES_KEY,
  MANGA_READER_SETTINGS_KEY,
  type MangaReaderDirection,
  type MangaReaderMode,
  type MangaReaderSettings,
} from '../lib/settings'

interface UseReaderSettingsOptions {
  mangaId: number
  webtoon: boolean
  ltr: boolean
}

export function useReaderSettings(options: UseReaderSettingsOptions) {
  const settings = useLocalStorage<MangaReaderSettings>(
    MANGA_READER_SETTINGS_KEY,
    { ...MANGA_READER_DEFAULT_SETTINGS },
    { mergeDefaults: true },
  )
  const modes = useLocalStorage<Record<string, MangaReaderMode>>(MANGA_READER_MODES_KEY, {})
  const directions = useLocalStorage<Record<string, MangaReaderDirection>>(
    MANGA_READER_DIRECTIONS_KEY,
    {},
  )

  const mode = computed<MangaReaderMode>({
    get: () => modes.value[options.mangaId] ?? (options.webtoon ? 'scroll' : 'paged'),
    set: value => {
      modes.value = { ...modes.value, [options.mangaId]: value }
    },
  })

  const direction = computed<MangaReaderDirection>({
    get: () => directions.value[options.mangaId] ?? (options.ltr ? 'ltr' : 'rtl'),
    set: value => {
      directions.value = { ...directions.value, [options.mangaId]: value }
    },
  })

  function update(patch: Partial<MangaReaderSettings>) {
    settings.value = { ...settings.value, ...patch }
  }

  return { settings, mode, direction, update }
}
