import { AGE_RATING_CN, GALGAME_EDITION_KIND_CN } from '@hikarinagi/shared'
import type { components } from '@hikarinagi/api-contract/v3'
import { langLabel } from '~/features/galgame/labels'
import { platformLabel } from '~/features/galgame/platforms'
import type { BackendFactValue } from './contract'

type EntryProperty = components['schemas']['FactDto']['property']

export const CREDIT_ROLE_LABELS: Record<string, string> = {
  DEVELOPER: '开发',
  PUBLISHER: '发行',
  LOCALIZER: '本地化',
  ORIGINAL_WORK: '原作',
  ORIGINAL_CONCEPT: '原案',
  PLANNING: '企划',
  DIRECTOR: '导演',
  PRODUCER: '制作人',
  SCENARIO: '剧本',
  ORIGINAL_ART: '原画',
  CHARACTER_DESIGN: '人物设定',
  SD_ART: 'SD 原画',
  BACKGROUND: '背景',
  ART: '美术',
  PROGRAM: '程序',
  STAGING: '演出',
  MOVIE: '动画',
  MUSIC: '音乐',
  LYRICS: '歌曲作词',
  COMPOSITION: '歌曲作曲',
  ARRANGEMENT: '歌曲编曲',
  VOCALS: '歌曲演唱',
  SOUND: '音响',
  SUPERVISION: '监修',
  COOPERATION: '协力',
  TRANSLATION: '翻译',
  UNOFFICIAL_TRANSLATOR: '非官方翻译',
  VOICE: '配音',
  AUTHOR: '作者',
  ILLUSTRATION: '插画',
  ART_BY: '作画',
  STORY: '脚本',
  EDITOR: '编者',
  LABEL: '文库',
  MAGAZINE: '杂志',
  CHINESE_PUBLISHER: '中文版出版社',
  OTHER: '其他',
}

export const ORGANIZATION_ROLES = ['DEVELOPER', 'PUBLISHER', 'LOCALIZER']

export const SONG_ROLES = ['LYRICS', 'COMPOSITION', 'ARRANGEMENT', 'VOCALS']

export const SONG_KIND_LABELS: Record<string, string> = {
  THEME: '主题歌',
  INSERT: '插入歌',
}

const RELEASE_STATUS_LABELS: Record<string, string> = {
  PLANNED: '计划中',
  RELEASED: '已发售',
  CANCELLED: '取消',
}

const IMPORT_SOURCE_LABELS: Record<string, string> = {
  VNDB: 'VNDB',
  BANGUMI: 'Bangumi',
}

export function creditRoleLabel(code: string): string {
  return CREDIT_ROLE_LABELS[code] ?? code
}

export function sharedSongKind(credits: { song_kind?: string | null }[]): string | null {
  const [kind, ...rest] = new Set(credits.map(credit => credit.song_kind))
  return kind && !rest.length ? (SONG_KIND_LABELS[kind] ?? null) : null
}

export function creditGroupLabel(code: string, credits: { song_kind?: string | null }[]): string {
  const kind = sharedSongKind(credits)
  return kind ? creditRoleLabel(code).replace('歌曲', kind) : creditRoleLabel(code)
}

export function versionKindLabel(code: string | null): string | null {
  return code
    ? (GALGAME_EDITION_KIND_CN[code as keyof typeof GALGAME_EDITION_KIND_CN] ?? code)
    : null
}

export function releaseStatusLabel(code: string | null): string | null {
  return code ? (RELEASE_STATUS_LABELS[code] ?? code) : null
}

export function ageRatingLabel(code: string | null): string | null {
  return code ? (AGE_RATING_CN[code as keyof typeof AGE_RATING_CN] ?? code) : null
}

export function importSourceText(codes: string[]): string {
  const named = [...new Set(codes.map(code => IMPORT_SOURCE_LABELS[code] ?? '旧站资料'))]
  return named.join('、')
}

const CHANNEL_LABELS: Record<string, string> = {
  STEAM: 'Steam',
  DLSITE: 'DLsite',
  FANZA: 'FANZA',
  GETCHU: 'Getchu',
  DIGIKET: 'DiGiket',
  GYUTTO: 'Gyutto',
  TORANOANA: 'とらのあな',
  PLAYSTATION_STORE: 'PlayStation Store',
  NINTENDO_ESHOP: 'ニンテンドーeショップ',
  GOOGLE_PLAY: 'Google Play',
}

export function channelLabel(code: string | null): string {
  return code ? (CHANNEL_LABELS[code] ?? code) : ''
}

export function factText(property: EntryProperty, value: BackendFactValue): string {
  if (property === 'PLATFORM') return platformLabel(value.code ?? value.text)
  if (property === 'LANGUAGE') return langLabel(value.code ?? value.text)
  if (property === 'RELEASE_STATUS') return releaseStatusLabel(value.code) ?? value.text
  if (property === 'AGE_RATING') return ageRatingLabel(value.code) ?? value.text
  if (property === 'CHANNEL_CODE') return `${channelLabel(value.code)} ${value.text}`
  if (property === 'CREDIT' && value.code) return `${creditRoleLabel(value.code)} ${value.text}`
  if (value.target_id !== null && value.code)
    return `${value.text}（${versionKindLabel(value.code)}）`
  return value.text
}

export function titleText(title: string | null | undefined): string {
  return title?.trim() ? title : '标题未详'
}
