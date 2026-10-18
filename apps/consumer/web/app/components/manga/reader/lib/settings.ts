export type MangaReaderMode = 'paged' | 'scroll'
export type MangaReaderLayout = 'single' | 'double' | 'auto'
export type MangaReaderFit = 'screen' | 'width' | 'height' | 'original'
export type MangaReaderBackground = 'black' | 'white' | 'system'
export type MangaReaderDirection = 'rtl' | 'ltr'

export interface MangaReaderSettings {
  layout: MangaReaderLayout
  cover_alone: boolean
  fit: MangaReaderFit
  background: MangaReaderBackground
  show_page_number: boolean
  page_animation: boolean
  tap_sides: boolean
}

export const MANGA_READER_SETTINGS_KEY = 'hikari-manga-reader-settings'
export const MANGA_READER_MODES_KEY = 'hikari-manga-reader-modes'
export const MANGA_READER_DIRECTIONS_KEY = 'hikari-manga-reader-directions'

export const MANGA_READER_DEFAULT_SETTINGS: MangaReaderSettings = {
  layout: 'auto',
  cover_alone: true,
  fit: 'screen',
  background: 'black',
  show_page_number: true,
  page_animation: true,
  tap_sides: true,
}

export const MANGA_READER_MODE_OPTIONS: { value: MangaReaderMode; label: string }[] = [
  { value: 'paged', label: '翻页' },
  { value: 'scroll', label: '条漫' },
]

export const MANGA_READER_DIRECTION_OPTIONS: { value: MangaReaderDirection; label: string }[] = [
  { value: 'rtl', label: '从右往左' },
  { value: 'ltr', label: '从左往右' },
]

export const MANGA_READER_LAYOUT_OPTIONS: { value: MangaReaderLayout; label: string }[] = [
  { value: 'single', label: '单页' },
  { value: 'double', label: '双页' },
  { value: 'auto', label: '自动' },
]

export const MANGA_READER_FIT_OPTIONS: { value: MangaReaderFit; label: string }[] = [
  { value: 'screen', label: '适应屏幕' },
  { value: 'width', label: '适宽' },
  { value: 'height', label: '适高' },
  { value: 'original', label: '原始' },
]

export const MANGA_READER_BACKGROUND_OPTIONS: { value: MangaReaderBackground; label: string }[] = [
  { value: 'black', label: '黑' },
  { value: 'white', label: '白' },
  { value: 'system', label: '跟随主题' },
]
