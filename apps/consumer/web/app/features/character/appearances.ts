import type { components } from '@hikarinagi/api-contract/v3'
import type { HikariImageSource } from '~/utils/media/image'
import { topVotedMedia } from '~/utils/media/image'

type Schemas = components['schemas']
type CharacterDetail = Schemas['CharacterDetailDto']
type Profile = Schemas['CharacterAppearanceProfileDto']

export type AppearanceKind = 'galgame' | 'light-novel' | 'manga'

export interface Appearance {
  key: string
  kind: AppearanceKind
  id: number
  title: string
  path: string
  cover: HikariImageSource
  nsfw: boolean
  date: string | null
  label: string | null
  group: string | null
  cast_role: Schemas['CharacterGalgameRelationDto']['cast_role']
  protagonist: boolean
  capturable: boolean
  image: Schemas['RatedMediaAssetDto'] | null
  intro: string | null
  trans_intro: string | null
  profile: Profile
  voices: Schemas['CharacterVoiceDto'][]
}

export interface CastMember {
  id: number
  name: string
  image: HikariImageSource
}

type Lists = {
  galgames: { items: Schemas['CharacterGalgameRelationDto'][] } | null
  light_novels: { items: Schemas['CharacterLightNovelRelationDto'][] } | null
  mangas: { items: Schemas['CharacterMangaRelationDto'][] } | null
}

export const KIND_LABELS: Record<AppearanceKind, string> = {
  galgame: '游戏',
  'light-novel': '轻小说',
  manga: '漫画',
}

const KIND_PATHS: Record<AppearanceKind, string> = {
  galgame: 'galgames',
  'light-novel': 'light-novels',
  manga: 'mangas',
}

export function appearancesOf(data: Lists): Appearance[] {
  const facts = (
    item: Omit<Schemas['CharacterMangaRelationDto'], 'manga'>,
    kind: AppearanceKind,
    id: number,
  ) => ({
    key: `${kind}:${id}`,
    kind,
    id,
    path: `/${KIND_PATHS[kind]}/${id}`,
    label: item.label,
    group: item.group,
    cast_role: item.cast_role,
    protagonist: item.protagonist,
    capturable: item.capturable,
    image: item.image,
    intro: item.intro,
    trans_intro: item.trans_intro,
    profile: item.profile,
  })
  const list: Appearance[] = [
    ...(data.galgames?.items ?? []).map(item => ({
      ...facts(item, 'galgame', item.galgame.id),
      title: item.galgame.trans_title || item.galgame.origin_title,
      cover: topVotedMedia(item.galgame.covers),
      nsfw: item.galgame.nsfw,
      date: item.galgame.release_date,
      voices: item.voices,
    })),
    ...(data.light_novels?.items ?? []).map(item => ({
      ...facts(item, 'light-novel', item.light_novel.id),
      title: item.light_novel.name_cn || item.light_novel.name,
      cover: topVotedMedia(item.light_novel.covers),
      nsfw: item.light_novel.nsfw,
      date: item.light_novel.publication_date,
      voices: [],
    })),
    ...(data.mangas?.items ?? []).map(item => ({
      ...facts(item, 'manga', item.manga.id),
      title: item.manga.name_cn || item.manga.name,
      cover: topVotedMedia(item.manga.covers),
      nsfw: item.manga.nsfw,
      date: item.manga.publication_date,
      voices: [],
    })),
  ]
  return list.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
}

export const defaultAppearance = (list: Appearance[]) =>
  list.filter(item => item.kind === 'galgame').at(-1) ?? list.at(-1) ?? null

export const yearOf = (date: string | null) => (date ? date.slice(0, 4) : '年份不详')

const KANA = /^[\p{Script=Hiragana}\p{Script=Katakana}ー・\s]+$/u
const compact = (text: string) => text.replace(/\s/g, '')
const words = (text: string) => text.trim().split(/\s+/).length

export function namesOf(character: Pick<CharacterDetail, 'name' | 'reading' | 'aliases'>) {
  const aliases = character.aliases.filter(alias => compact(alias) !== compact(character.name))
  const kana = aliases.filter(
    alias =>
      KANA.test(alias) && !KANA.test(character.name) && words(alias) === words(character.name),
  )
  const reading = character.reading ?? (kana.length === 1 ? (kana[0] ?? null) : null)
  return { reading, aliases: aliases.filter(alias => alias !== reading) }
}

export function viewOf(character: CharacterDetail, list: Appearance[], work: Appearance | null) {
  const base: Profile = {
    ...character.profile,
    gender: character.gender,
    blood_type: character.blood_type,
  }
  const profile = Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, work?.profile[key as keyof Profile] || value]),
  ) as Profile
  const time = (item: Appearance) => (item.date ? Date.parse(item.date) : 0)
  const from = work ? time(work) : 0
  const distance = (item: Appearance) =>
    time(item) <= from ? from - time(item) : (time(item) - from) * 2
  const told = (item: Appearance) => item.trans_intro || item.intro
  const near =
    work && told(work) ? null : list.filter(told).sort((a, b) => distance(a) - distance(b))[0]
  const source = work && told(work) ? work : (near ?? character)
  return {
    image: work?.image ?? character.image,
    nsfw: work?.nsfw ?? false,
    profile,
    intro: source.trans_intro || source.intro,
    original: !source.trans_intro,
    introFrom: near ?? null,
  }
}

export function profileRows(profile: Profile) {
  return [
    { label: '性别', value: profile.gender },
    { label: '生日', value: profile.birthday?.replace(/^(\d+)月(\d+)日$/, '$1 月 $2 日') },
    { label: '年龄', value: profile.age },
    { label: '身高', value: profile.height?.replace(/(\d+)cm$/, '$1 cm') },
    { label: '体重', value: profile.weight?.replace(/(\d+)kg$/, '$1 kg') },
    { label: '三围', value: profile.measurements?.replace(/\//g, ' ') },
    { label: '血型', value: profile.blood_type },
  ].flatMap(row => (row.value ? [{ label: row.label, value: row.value }] : []))
}

export function voiceSummary(list: Appearance[]) {
  const people = new Map<
    string,
    { person: number | null; count: number; first: string; texts: Map<string, number> }
  >()
  for (const item of list)
    for (const voice of item.voices) {
      const key = voice.person_id === null ? `t${voice.text}` : `p${voice.person_id}`
      const entry = people.get(key) ?? {
        person: voice.person_id,
        count: 0,
        first: item.date ?? '',
        texts: new Map<string, number>(),
      }
      entry.count++
      entry.texts.set(voice.text, (entry.texts.get(voice.text) ?? 0) + 1)
      people.set(key, entry)
    }
  return [...people.values()]
    .map(entry => ({
      person: entry.person,
      count: entry.count,
      first: entry.first,
      text: [...entry.texts].sort((a, b) => b[1] - a[1])[0]![0],
    }))
    .sort((a, b) => b.count - a.count || a.first.localeCompare(b.first))
}

export function galgameCast(rows: Schemas['GalgameCharacterRelationDto'][]): CastMember[] {
  return rows
    .filter(row => !row.appearance?.hidden)
    .map(row => ({
      id: row.character.id,
      name: row.character.name,
      image: row.appearance?.image ?? row.character.image,
    }))
}

export function seriesCast(rows: { character: Schemas['CharacterPreviewDto'] }[]): CastMember[] {
  return rows.map(row => ({
    id: row.character.id,
    name: row.character.name,
    image: row.character.image,
  }))
}
