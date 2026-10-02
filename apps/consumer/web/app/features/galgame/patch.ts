import { fileSizeLabel } from '~/features/galgame/download'
import { sortByOrder } from '~/utils/order'

const TYPE_LABELS: Record<string, string> = {
  manual: '人工翻译补丁',
  ai: 'AI 翻译补丁',
  machine_polishing: '机翻润色',
  machine: '机翻补丁',
  save: '全 CG 存档',
  crack: '破解补丁',
  fix: '修正补丁',
  mod: '魔改补丁',
  r18: 'R18 成人内容补丁',
  decensor: '去马赛克补丁',
  image: '修图补丁',
  other: '其他',
}

const LANGUAGE_LABELS: Record<string, string> = {
  'zh-Hans': '简体中文',
  'zh-Hant': '繁体中文',
  ja: '日文',
  en: '英文',
  other: '其他语言',
}

const PLATFORM_LABELS: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  other: '其他平台',
}

export function patchTypeLabel(code: string): string {
  return TYPE_LABELS[code] ?? code
}

function labelOptions(codes: string[], labels: Record<string, string>) {
  return sortByOrder([...new Set(codes)], Object.keys(labels)).map(code => ({
    value: code,
    label: labels[code] ?? code,
  }))
}

export function patchTypeOptions(codes: string[]) {
  return labelOptions(codes, TYPE_LABELS)
}

export function patchLanguageOptions(codes: string[]) {
  return labelOptions(codes, LANGUAGE_LABELS)
}

export function patchPlatformOptions(codes: string[]) {
  return labelOptions(codes, PLATFORM_LABELS)
}

export function patchLanguages(codes: string[]): string {
  return patchLanguageOptions(codes)
    .map(option => option.label)
    .join('、')
}

export function patchPlatforms(codes: string[]): string {
  return patchPlatformOptions(codes)
    .map(option => option.label)
    .join('、')
}

export function patchSizeBytes(size: string): number | null {
  const match = /^([\d.]+)\s*([KMGT]?)B$/i.exec(size.trim())
  if (!match) return null

  const power = ['', 'K', 'M', 'G', 'T'].indexOf(match[2]!.toUpperCase())
  return Number(match[1]) * 1024 ** power
}

export function patchSizeLabel(size: string): string {
  const bytes = patchSizeBytes(size)
  return bytes === null ? size : fileSizeLabel(bytes)
}
