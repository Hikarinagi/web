export type MangaReaderLayout = 'single' | 'double'
export type MangaReaderFit = 'screen' | 'width' | 'height' | 'original'
export type MangaReaderBackground = 'black' | 'white' | 'system'

export interface MangaReaderSettings {
  layout: MangaReaderLayout
  fit: MangaReaderFit
  background: MangaReaderBackground
  show_page_number: boolean
  /** `false` cuts straight to the next page instead of dragging/animating it. */
  page_animation: boolean
}

export const MANGA_READER_SETTINGS_KEY = 'hikari-manga-reader-settings'

export const MANGA_READER_DEFAULT_SETTINGS: MangaReaderSettings = {
  layout: 'single',
  fit: 'screen',
  background: 'black',
  show_page_number: true,
  page_animation: true,
}

export const MANGA_READER_LAYOUT_OPTIONS: { value: MangaReaderLayout; label: string }[] = [
  { value: 'single', label: '单页' },
  { value: 'double', label: '双页' },
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

export const MANGA_READER_FIT_LABEL: Record<MangaReaderFit, string> = {
  screen: '适应屏幕',
  width: '适宽',
  height: '适高',
  original: '原始',
}
