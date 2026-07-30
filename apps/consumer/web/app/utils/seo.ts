export const SEO_TITLE_MAX_LENGTH = 90
export const SEO_DESCRIPTION_MAX_LENGTH = 160
export type SeoSource = string | null | undefined | readonly (string | null | undefined)[]
export interface SeoTextOptions {
  maxLength?: number | false
}
export interface SeoTitleOptions extends SeoTextOptions {
  appendSiteName?: boolean
}

const KANA_PATTERN = /[ぁ-ゖァ-ヺーｦ-ﾝ]/g
const HAN_PATTERN = /[㐀-䶿一-鿿]/g
const KANA_RATIO_LIMIT = 0.2

export function zhText(value: string | null | undefined) {
  if (!value) return undefined

  const han = value.match(HAN_PATTERN)?.length ?? 0
  if (!han) return undefined

  const kana = value.match(KANA_PATTERN)?.length ?? 0

  return kana / (kana + han) < KANA_RATIO_LIMIT ? value : undefined
}

export function toSeoText(source: SeoSource, options: SeoTextOptions = {}) {
  for (const value of toSourceList(source)) {
    const text = normalizeText(value, options)
    if (text) return text
  }

  return undefined
}

export function buildSeoTitle(source: SeoSource, siteName: string, options: SeoTitleOptions = {}) {
  const title = toSeoText(source, { maxLength: options.maxLength ?? SEO_TITLE_MAX_LENGTH })
  const appendSiteName = options.appendSiteName ?? true

  if (!title) return siteName
  if (!appendSiteName || title === siteName || title.endsWith(` - ${siteName}`)) return title

  return `${title} - ${siteName}`
}

export function resolveSeoUrl(path: string | null | undefined, siteUrl: string) {
  const base = siteUrl.trim()
  const value = path?.trim()

  if (!base || !value) return undefined

  try {
    return new URL(value, base.endsWith('/') ? base : `${base}/`).toString()
  } catch {
    return undefined
  }
}

function toSourceList(source: SeoSource) {
  return Array.isArray(source) ? source : [source]
}

const HTML_TAG_PATTERN = /<[^>]+>/g
const WHITESPACE_PATTERN = /\s+/g
function normalizeText(value: string | null | undefined, options: SeoTextOptions) {
  if (!value) return undefined

  const text = value.replace(HTML_TAG_PATTERN, ' ').replace(WHITESPACE_PATTERN, ' ').trim()

  if (!text) return undefined
  if (options.maxLength === false) return text

  return Array.from(text)
    .slice(0, options.maxLength ?? SEO_DESCRIPTION_MAX_LENGTH)
    .join('')
    .trim()
}
