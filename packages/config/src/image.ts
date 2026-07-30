import { HIKARI_THIRD_PARTY_PROVIDER_PATHS } from './media.js'

export type HikariImageFit = 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
export type HikariImageFormat = 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
export type HikariImageGravity =
  | 'auto'
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'face'

export interface HikariImageProcessingOptions {
  width?: number
  w?: number
  height?: number
  h?: number
  quality?: number
  q?: number
  format?: HikariImageFormat
  f?: HikariImageFormat
  fit?: HikariImageFit
  gravity?: HikariImageGravity
  g?: HikariImageGravity
  dpr?: 1 | 2 | 3
  background?: string
  blur?: number
  brightness?: number
  contrast?: number
  gamma?: number
  sharpen?: number
  saturation?: number
  rotate?: 90 | 180 | 270
  trim?: boolean
  pad?: boolean
}

export const HIKARI_IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, fit: 'cover', quality: 80, format: 'webp' },
  small: { width: 300, quality: 85, fit: 'scale-down', format: 'webp' },
  medium: { width: 600, quality: 85, fit: 'scale-down', format: 'webp' },
  large: { width: 1200, quality: 85, fit: 'scale-down', format: 'webp' },
  avatar: { width: 200, height: 200, fit: 'cover', quality: 90, format: 'webp' },
  banner: { width: 1920, height: 600, fit: 'cover', quality: 85, format: 'webp' },
  hq: { quality: 95, fit: 'scale-down', format: 'webp' },
  modern: { quality: 80, fit: 'scale-down', format: 'avif' },
} as const satisfies Record<string, HikariImageProcessingOptions>

export type HikariImagePresetName = keyof typeof HIKARI_IMAGE_PRESETS
export type HikariImageProcessing = HikariImageProcessingOptions | false

export interface HikariImageResolveOptions {
  cdnHost?: string
  imageProcessorHost?: string
  fallbackSrc?: string
  preset?: HikariImagePresetName
  processing?: HikariImageProcessing
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function joinUrl(host: string, path: string): string {
  if (!host) return path.replace(/^\/+/, '')
  return `${host.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

function getProcessorSourcePath(source: string, cdnHost?: string): string | undefined {
  if (!isHttpUrl(source)) return source

  const sourceUrl = new URL(source)
  const providerPath = HIKARI_THIRD_PARTY_PROVIDER_PATHS[sourceUrl.hostname]
  const path = `${sourceUrl.pathname}${sourceUrl.search}`

  if (providerPath) return `${providerPath}/${sourceUrl.origin}${path}`

  const cdnHostName = cdnHost ? new URL(cdnHost).hostname : undefined

  return sourceUrl.hostname === cdnHostName ? path : undefined
}

export function buildProcessUrl(
  source: string,
  imageProcessorHost: string,
  options: HikariImageProcessingOptions,
  resolveOptions: Pick<HikariImageResolveOptions, 'cdnHost'> = {},
): string | undefined {
  const sourcePath = getProcessorSourcePath(source, resolveOptions.cdnHost)
  if (!sourcePath) return undefined

  const url = new URL(joinUrl(imageProcessorHost, sourcePath))
  const entries = {
    w: options.width ?? options.w,
    h: options.height ?? options.h,
    q: options.quality ?? options.q,
    f: options.format ?? options.f ?? 'webp',
    fit: options.fit,
    gravity: options.gravity ?? options.g,
    dpr: options.dpr,
    background: options.background,
    blur: options.blur === undefined ? undefined : Math.min(Math.max(options.blur, 0), 100),
    brightness: options.brightness,
    contrast: options.contrast,
    gamma: options.gamma,
    sharpen: options.sharpen,
    saturation: options.saturation,
    rotate: options.rotate,
    trim: options.trim ? 'true' : undefined,
    pad: options.pad ? 'true' : undefined,
  }

  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })

  return url.toString()
}

// resolveImageUrl 是否会让这张图真正走图片处理器(而非直出原图)。
// nsfw 模糊依赖处理器加 blur 参数,未通过处理器的图无法被安全模糊,调用方应据此 fail-closed。
export function canProcessImage(
  source: string | null | undefined,
  options: Pick<HikariImageResolveOptions, 'cdnHost' | 'imageProcessorHost'> = {},
): boolean {
  const src = source?.trim()
  if (!src || !options.imageProcessorHost) return false
  if (src.startsWith('blob:') || src.startsWith('data:image') || src.startsWith('/')) return false
  return getProcessorSourcePath(src, options.cdnHost) !== undefined
}

export function resolveImageUrl(
  source: string | null | undefined,
  options: HikariImageResolveOptions = {},
): string {
  const src = source?.trim()
  const fallbackSrc = options.fallbackSrc?.trim()

  if (!src) return fallbackSrc ? resolveImageUrl(fallbackSrc, { ...options, fallbackSrc: '' }) : ''
  if (src.startsWith('blob:') || src.startsWith('data:image') || src.startsWith('/')) return src

  const directUrl = isHttpUrl(src) ? src : joinUrl(options.cdnHost ?? '', src)
  const preset = options.preset ? HIKARI_IMAGE_PRESETS[options.preset] : undefined
  const processing = typeof options.processing === 'object' ? options.processing : undefined
  const merged = { ...preset, ...processing }

  if (options.processing === false || !options.imageProcessorHost || !Object.keys(merged).length) {
    return directUrl
  }

  try {
    return (
      buildProcessUrl(src, options.imageProcessorHost, merged, { cdnHost: options.cdnHost }) ??
      directUrl
    )
  } catch {
    return directUrl
  }
}
