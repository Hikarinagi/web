export interface ReaderThemePreset {
  index: number
  label: string
  backgroundColor: string
  textColor: string
}

export const READER_THEME_PRESETS: readonly ReaderThemePreset[] = [
  { index: 0, label: '默认', backgroundColor: '#ffffff', textColor: '#1f2937' },
  { index: 1, label: '柔白', backgroundColor: '#fdf6e3', textColor: '#3a3a3a' },
  { index: 2, label: '暖米', backgroundColor: '#f4ead4', textColor: '#2d2a22' },
  { index: 3, label: '淡绿', backgroundColor: '#e4efe4', textColor: '#1f2d1f' },
  { index: 4, label: '浅灰', backgroundColor: '#ebebeb', textColor: '#1f1f1f' },
  { index: 5, label: '夜间', backgroundColor: '#1f2227', textColor: '#e6e6e6' },
  { index: 6, label: '深黑', backgroundColor: '#111111', textColor: '#dadada' },
]

export function findPresetByColors(background: string, text: string) {
  const bg = background.toLowerCase()
  const tx = text.toLowerCase()
  return READER_THEME_PRESETS.find(
    preset => preset.backgroundColor.toLowerCase() === bg && preset.textColor.toLowerCase() === tx,
  )
}

export const READER_SYSTEM_THEME_INDEX = 100

const SYSTEM_LIGHT_PRESET = 0
const SYSTEM_DARK_PRESET = 5

export function systemThemeColors(scheme: 'light' | 'dark') {
  const target = READER_THEME_PRESETS.find(
    preset => preset.index === (scheme === 'dark' ? SYSTEM_DARK_PRESET : SYSTEM_LIGHT_PRESET),
  )!
  return { background_color: target.backgroundColor, text_color: target.textColor }
}

export const READER_FONT_SIZE_RANGE = { min: 12, max: 36, step: 1, default: 18 }
export const READER_LINE_HEIGHT_RANGE = { min: 1, max: 2.4, step: 0.1, default: 1.75 }
export const READER_MARGIN_RANGE = { min: 0, max: 120, step: 4, default: 64 }

// Values resolve inside the engine, which shapes with pinned faces only:
// the generic families map to the pinned font policy's roles (serif =
// Tinos + Source Han Serif, sans-serif = Arimo + Source Han Sans).
// Platform font names are not resolvable there and must not be listed.
export const READER_FONT_FAMILIES = [
  { value: '', label: '跟随书籍' },
  { value: 'serif', label: '衬线（思源宋体）' },
  { value: 'sans-serif', label: '无衬线（思源黑体）' },
]
