import { sortByOrder } from '~/utils/order'

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

export function fileSizeLabel(bytes: string | number): string {
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
  jp: '日文',
  en: '英文',
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code
}

export function sortLanguages(codes: string[]): string[] {
  return sortByOrder(codes, Object.keys(LANGUAGE_LABELS))
}

const STORE_LINKS = new Set([
  'steam',
  'gog',
  'dlsite',
  'dmm',
  'getchu',
  'getchudl',
  'gyutto',
  'digiket',
  'melonjp',
  'melon',
  'toranoana',
  'animateg',
  'booth',
  'denpa',
  'mg',
  'jlist',
  'jastusa',
  'johren',
  'kagura',
  'nutaku',
  'fakku',
  'itch',
  'googplay',
  'appstore',
  'nintendo',
  'nintendo_jp',
  'nintendo_hk',
  'playstation_jp',
  'playstation_na',
  'playstation_eu',
  'playstation_hk',
  'freem',
  'freegame',
  'novelgam',
  'gamejolt',
  'patreon',
  'patreonp',
])

export function storeLinks<T extends { name: string }>(links: T[]): T[] {
  return links.filter(
    (link, index) =>
      STORE_LINKS.has(link.name) && links.findIndex(other => other.name === link.name) === index,
  )
}
