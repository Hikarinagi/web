export interface ReaderThemeTokens {
  barBackground: string
  barBorder: string
  barShadow: string
  textColor: string
  textMuted: string
  iconColor: string
  iconHoverBg: string
  scheme: 'light' | 'dark'
}

interface Rgb {
  r: number
  g: number
  b: number
}

const DEFAULT_LIGHT_TOKENS: ReaderThemeTokens = {
  barBackground: 'rgba(255, 255, 255, 0.72)',
  barBorder: 'rgba(15, 23, 42, 0.08)',
  barShadow: '0 1px 12px rgba(15, 23, 42, 0.06)',
  textColor: 'rgba(15, 23, 42, 0.92)',
  textMuted: 'rgba(15, 23, 42, 0.55)',
  iconColor: 'rgba(15, 23, 42, 0.82)',
  iconHoverBg: 'rgba(15, 23, 42, 0.06)',
  scheme: 'light',
}

const DEFAULT_DARK_TOKENS: ReaderThemeTokens = {
  barBackground: 'rgba(20, 24, 32, 0.66)',
  barBorder: 'rgba(255, 255, 255, 0.08)',
  barShadow: '0 1px 12px rgba(0, 0, 0, 0.32)',
  textColor: 'rgba(245, 247, 250, 0.94)',
  textMuted: 'rgba(245, 247, 250, 0.58)',
  iconColor: 'rgba(245, 247, 250, 0.86)',
  iconHoverBg: 'rgba(255, 255, 255, 0.08)',
  scheme: 'dark',
}

export function deriveReaderTheme(
  backgroundColor: string | null | undefined,
  textColor: string | null | undefined,
): ReaderThemeTokens {
  const bg = parseColor(backgroundColor)
  if (!bg) return DEFAULT_LIGHT_TOKENS

  const luminance = relativeLuminance(bg)
  const isLight = luminance > 0.5
  const fallback = isLight ? DEFAULT_LIGHT_TOKENS : DEFAULT_DARK_TOKENS
  const overlay = isLight
    ? mix(bg, { r: 0, g: 0, b: 0 }, 0.06)
    : mix(bg, { r: 255, g: 255, b: 255 }, 0.08)
  const borderTint = isLight ? { r: 15, g: 23, b: 42 } : { r: 255, g: 255, b: 255 }
  const resolvedText = pickAccessibleText(bg, textColor, isLight)

  return {
    barBackground: rgba(overlay, isLight ? 0.72 : 0.64),
    barBorder: rgba(borderTint, isLight ? 0.1 : 0.12),
    barShadow: isLight ? '0 1px 12px rgba(15, 23, 42, 0.08)' : '0 1px 16px rgba(0, 0, 0, 0.36)',
    textColor: rgba(resolvedText, 0.92),
    textMuted: rgba(resolvedText, 0.58),
    iconColor: rgba(resolvedText, 0.82),
    iconHoverBg: rgba(borderTint, isLight ? 0.08 : 0.1),
    scheme: fallback.scheme,
  }
}

export function isDarkBackground(color: string | null | undefined): boolean {
  const rgb = parseColor(color)
  if (!rgb) return false
  return relativeLuminance(rgb) <= 0.5
}

function parseColor(value: string | null | undefined): Rgb | null {
  if (!value) return null
  const trimmed = value.trim()
  const hex = parseHex(trimmed)
  if (hex) return hex
  return parseRgb(trimmed)
}

function parseHex(value: string): Rgb | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)
  if (!match) return null
  let hex = match[1]!
  if (hex.length === 3)
    hex = hex
      .split('')
      .map(ch => ch + ch)
      .join('')
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

function parseRgb(value: string): Rgb | null {
  const match = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/.exec(value)
  if (!match) return null
  return {
    r: clamp255(Number(match[1])),
    g: clamp255(Number(match[2])),
    b: clamp255(Number(match[3])),
  }
}

function clamp255(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(255, Math.round(value)))
}

function channelLuminance(channel: number) {
  const srgb = channel / 255
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(rgb: Rgb) {
  const r = channelLuminance(rgb.r)
  const g = channelLuminance(rgb.g)
  const b = channelLuminance(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: Rgb, b: Rgb) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [bright, dark] = la >= lb ? [la, lb] : [lb, la]
  return (bright + 0.05) / (dark + 0.05)
}

function mix(a: Rgb, b: Rgb, weight: number): Rgb {
  const w = Math.max(0, Math.min(1, weight))
  return {
    r: Math.round(a.r * (1 - w) + b.r * w),
    g: Math.round(a.g * (1 - w) + b.g * w),
    b: Math.round(a.b * (1 - w) + b.b * w),
  }
}

function rgba(rgb: Rgb, alpha: number) {
  const a = Math.max(0, Math.min(1, alpha))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
}

function pickAccessibleText(bg: Rgb, configuredText: string | null | undefined, isLight: boolean) {
  const configured = parseColor(configuredText)
  if (configured && contrastRatio(bg, configured) >= 4.5) return configured
  return isLight ? { r: 15, g: 23, b: 42 } : { r: 245, g: 247, b: 250 }
}
