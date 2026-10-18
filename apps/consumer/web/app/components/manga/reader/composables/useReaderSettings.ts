import {
  MANGA_READER_DEFAULT_SETTINGS,
  MANGA_READER_FIT_OPTIONS,
  MANGA_READER_SETTINGS_KEY,
  type MangaReaderSettings,
} from '../lib/settings'

export function useReaderSettings() {
  const settings = useLocalStorage<MangaReaderSettings>(
    MANGA_READER_SETTINGS_KEY,
    { ...MANGA_READER_DEFAULT_SETTINGS },
    { mergeDefaults: true },
  )

  function toggleLayout() {
    settings.value = {
      ...settings.value,
      layout: settings.value.layout === 'single' ? 'double' : 'single',
    }
  }

  function cycleFit() {
    const index = MANGA_READER_FIT_OPTIONS.findIndex(option => option.value === settings.value.fit)
    const next = MANGA_READER_FIT_OPTIONS[(index + 1) % MANGA_READER_FIT_OPTIONS.length]
    if (next) settings.value = { ...settings.value, fit: next.value }
  }

  return { settings, toggleLayout, cycleFit }
}
