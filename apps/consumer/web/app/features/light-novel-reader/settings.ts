import { READER_SYSTEM_THEME, READER_THEMES } from './themes'

export type ReaderFontId = 'original' | 'song' | 'kai'
export type ReaderSpread = 'auto' | 'single' | 'double'
export type ReaderEffect = 'paper' | 'cover' | 'slide' | 'fade' | 'none'

export interface ReaderDeviceSettings {
  fontSize: number
  lineHeight: number
  margin: number
  spread: ReaderSpread
  effect: ReaderEffect
  tapTurn: boolean
  showTime: boolean
  showGuide: boolean
  keepAwake: boolean
}

export const READER_FONT_IDS: readonly ReaderFontId[] = ['original', 'song', 'kai']

export const READER_RANGES = {
  fontSize: { min: 12, max: 36, step: 1 },
  lineHeight: { min: 1.2, max: 2.4, step: 0.1 },
  margin: { min: 0, max: 120, step: 4 },
} as const

export const READER_SPREADS: readonly { value: ReaderSpread; label: string }[] = [
  { value: 'auto', label: '自动' },
  { value: 'single', label: '单页' },
  { value: 'double', label: '双页' },
]

export const READER_EFFECTS: readonly { value: ReaderEffect; label: string }[] = [
  { value: 'paper', label: '仿真' },
  { value: 'cover', label: '覆盖' },
  { value: 'slide', label: '滑动' },
  { value: 'fade', label: '淡入' },
  { value: 'none', label: '无' },
]

export function deviceDefaults(phone: boolean): ReaderDeviceSettings {
  return {
    fontSize: phone ? 17 : 18,
    lineHeight: 1.9,
    margin: phone ? 24 : 60,
    spread: 'auto',
    effect: 'paper',
    tapTurn: false,
    showTime: false,
    showGuide: true,
    keepAwake: true,
  }
}

export function accountTheme(index: number | undefined) {
  if (index === READER_SYSTEM_THEME) return index
  return READER_THEMES.some(theme => theme.index === index) ? index! : READER_SYSTEM_THEME
}

export function accountFont(value: string | undefined): ReaderFontId {
  return READER_FONT_IDS.find(id => id === value) ?? 'original'
}
