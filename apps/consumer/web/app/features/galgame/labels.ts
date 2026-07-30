import { ORIGIN_LANGUAGE_CODES } from '@hikarinagi/shared'
import type { components } from '@hikarinagi/api-contract/v3'

export const LANGUAGE_LABELS = {
  ja: '日语',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁体中文',
  en: '英语',
  ko: '韩语',
  ru: '俄语',
  fr: '法语',
  de: '德语',
  es: '西班牙语',
  it: '意大利语',
  'pt-br': '葡萄牙语(巴西)',
  'pt-pt': '葡萄牙语',
  pl: '波兰语',
  uk: '乌克兰语',
  vi: '越南语',
  th: '泰语',
  id: '印尼语',
  nl: '荷兰语',
  ar: '阿拉伯语',
  tr: '土耳其语',
} satisfies Record<string, string>

export type LanguageCode = keyof typeof LANGUAGE_LABELS

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = ORIGIN_LANGUAGE_CODES.map(
  value => ({ value, label: LANGUAGE_LABELS[value] }),
)

export const DEV_STATUS_LABELS: Record<string, string> = {
  RELEASED: '已发售',
  IN_DEVELOPMENT: '开发中',
  CANCELLED: '开发终止',
}

export const RELATION_LABELS: Record<string, string> = {
  SEQUEL: '续作',
  PREQUEL: '前作',
  SIDE_STORY: '外传',
  MAIN_STORY: '主线故事',
  VARIANT: '不同版本',
  MAIN_VERSION: '主版本',
  COLLECTION: '合集',
  COLLECTED_WORK: '收录作品',
  SAME_UNIVERSE: '同一世界观',
  DIFFERENT_ADAPTATION: '不同改编',
  EXPANSION: '资料片',
}

export const PRODUCER_ROLE_LABELS: Record<string, string> = {
  DEVELOPER: '开发商',
  PUBLISHER: '发行商',
  LOCALIZER: '本地化',
}

export const PRODUCER_TYPE_LABELS: Record<string, string> = {
  COMPANY: '厂商',
  DOUJIN: '同人社团',
  INDIVIDUAL: '个人',
}

export const STAFF_ROLE_LABELS = {
  GAME_DESIGNER: '游戏设计师',
  DIRECTOR: '导演',
  PRODUCER: '制作人',
  SUPERVISOR: '监修',
  EXECUTIVE_PRODUCER: '制作总指挥',
  ORIGINAL_WORK: '原作',
  CHARACTER_DESIGN: '人物设定',
  MECHANICAL_DESIGN: '机械设定',
  LEVEL_DESIGN: '关卡设计',
  PLANNING: '企画',
  PROGRAM: '程序',
  QC: 'QC',
  SCENARIO: '剧本',
  SERIES_COMPOSITION: '系列构成',
  ANIMATION_SUPERVISOR: '作画监督',
  ART: '原画',
  GRAPHICS: '美工',
  CG_SUPERVISOR: 'CG 监修',
  SD_ART: 'SD原画',
  BACKGROUND: '背景',
  COVER_ART: '海报',
  SOUND_DIRECTOR: '音响监督',
  MUSIC: '音乐',
  THEME_COMPOSITION: '主题歌作曲',
  THEME_LYRICS: '主题歌作词',
  THEME_PERFORMANCE: '主题歌演出',
  INSERT_PERFORMANCE: '插入歌演出',
  ANIMATION_PRODUCTION: '动画制作',
  ANIMATION_DIRECTOR: '动画监督',
  ANIMATION_SCRIPT: '动画剧本',
  COOPERATION: '协力',
  TRANSLATOR: '翻译',
  EDITOR: '编辑',
} satisfies Record<components['schemas']['GalgameStaffRole'], string>

export const CURRENCY_SYMBOL: Record<string, string> = {
  JPY: '¥',
  CNY: '¥',
  USD: '$',
  TWD: 'NT$',
  HKD: 'HK$',
  KRW: '₩',
}

export function langLabel(code: string | null | undefined): string {
  return (code && LANGUAGE_LABELS[code as LanguageCode]) || code || ''
}

export function devStatusLabel(code: string | null | undefined): string {
  return (code && DEV_STATUS_LABELS[code]) || code || ''
}

export function relationLabel(code: string | null | undefined): string {
  return (code && RELATION_LABELS[code]) || code || ''
}

export function producerRoleLabel(code: string | null | undefined): string {
  return (code && PRODUCER_ROLE_LABELS[code]) || code || ''
}

export function staffRoleLabel(code: string | null | undefined): string {
  return (code && STAFF_ROLE_LABELS[code as keyof typeof STAFF_ROLE_LABELS]) || code || ''
}
