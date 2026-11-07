import { thumbHashToAverageRGBA, thumbHashToDataURL } from 'thumbhash'

const NEUTRAL: [number, number, number] = [40, 44, 52]

function decode(hash: string) {
  return Uint8Array.from(atob(hash), char => char.charCodeAt(0))
}

export const blurUrl = (hash?: string | null) =>
  hash ? thumbHashToDataURL(decode(hash)) : undefined

function averageColor(hash?: string | null): [number, number, number] {
  if (!hash) return NEUTRAL
  const { r, g, b } = thumbHashToAverageRGBA(decode(hash))
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function toHsl([r, g, b]: [number, number, number]) {
  const [red, green, blue] = [r / 255, g / 255, b / 255]
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  if (max === min) return [0, 0]
  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  const hue =
    max === red
      ? (green - blue) / delta + (green < blue ? 6 : 0)
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4
  return [hue * 60, saturation]
}

export function stageTone(hash?: string | null) {
  const [hue, saturation] = toHsl(averageColor(hash)) as [number, number]
  const h = Math.round(hue)
  const s = Math.round(Math.min(Math.max(saturation * 1.4, 0.12), 0.42) * 100)
  return {
    '--tone-deep': `hsl(${h} ${s}% 9%)`,
    '--tone-deep-2': `hsl(${h} ${s}% 12.5%)`,
    '--tone-line': `hsl(${h} ${Math.min(s, 30)}% 20%)`,
    '--tone-soft': `hsl(${h} ${Math.max(s, 25)}% 92%)`,
    '--tone-paper': `hsl(${h} ${Math.min(Math.max(s, 18), 30)}% 97%)`,
    '--tone-ink': `hsl(${h} ${Math.max(s, 35)}% 70%)`,
  }
}
