import type { GalgameDownloadsPageData } from '~~/server/api/pages/galgames/[id]/downloads.get'

export type GalgameDownloadResource = GalgameDownloadsPageData['resources'][number]

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

export function fileSizeLabel(bytes: string): string {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '未知大小'

  let size = value
  let unit = 0
  while (size >= 1024 && unit < SIZE_UNITS.length - 1) {
    size /= 1024
    unit += 1
  }

  return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${SIZE_UNITS[unit]}`
}

const LANGUAGE_LABELS: Record<string, string> = {
  zh: '简体中文',
  'zh-hant': '繁体中文',
  en: '英文',
  jp: '日文',
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code
}
