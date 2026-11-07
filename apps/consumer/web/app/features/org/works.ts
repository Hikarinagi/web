import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
import { topVotedMedia } from '~/utils/media/image'

type Cover = NonNullable<ReturnType<typeof topVotedMedia<ProducerGameCover>>>
type ProducerGameCover = NonNullable<
  NonNullable<ProducerPageData['galgames']>['items'][number]['galgame']['covers'][number]['media']
>

export type OrgWorkKind = 'game' | 'novel' | 'manga'
export type OrgMode = 'history' | 'shelf' | 'hub' | 'serials'

export interface OrgWork {
  kind: OrgWorkKind
  id: number
  title: string
  original: string
  cover: Cover | null
  date: string | null
  roles: string[]
  rating: { average: number | null; count: number }
  volumes: number | null
  label: { id: number; name: string } | null
  people: { code: string; person_id: number; name: string }[]
  authors: string
}

export const KIND_PATHS: Record<OrgWorkKind, string> = {
  game: 'galgames',
  novel: 'light-novels',
  manga: 'mangas',
}

export const today = () => new Date().toISOString().slice(0, 10)
const dayOf = (value: string | null | undefined) => value?.slice(0, 10) ?? null

export function orgWorks(data: ProducerPageData): OrgWork[] {
  const games = (data.galgames?.items ?? []).map(item => ({
    kind: 'game' as const,
    id: item.galgame.id,
    title: item.galgame.trans_title || item.galgame.origin_title,
    original: item.galgame.origin_title,
    cover: topVotedMedia(item.galgame.covers),
    date: dayOf(item.galgame.release_date),
    roles: item.codes,
    rating: item.rating,
    volumes: null,
    label: null,
    people: item.people,
    authors: '',
  }))
  const novels = (data.light_novels?.items ?? []).map(item => ({
    kind: 'novel' as const,
    id: item.light_novel.id,
    title: item.light_novel.name_cn || item.light_novel.name,
    original: item.light_novel.name,
    cover: topVotedMedia(item.light_novel.covers),
    date: dayOf(item.light_novel.publication_date),
    roles: item.codes,
    rating: item.rating,
    volumes: item.volume_count,
    label: item.light_novel.bunko,
    people: [],
    authors: item.light_novel.author?.name ?? '',
  }))
  const mangas = (data.mangas?.items ?? []).map(item => ({
    kind: 'manga' as const,
    id: item.manga.id,
    title: item.manga.name_cn || item.manga.name,
    original: item.manga.name,
    cover: topVotedMedia(item.manga.covers),
    date: dayOf(item.manga.publication_date),
    roles: item.codes,
    rating: item.rating,
    volumes: item.volume_count,
    label: null,
    people: item.people,
    authors: item.people.map(person => person.name).join('、'),
  }))
  return [...games, ...novels, ...mangas].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export function orgMode(data: ProducerPageData): OrgMode {
  const type = data.producer.organization_type
  if (type === 'LABEL') return 'shelf'
  if (type === 'PLATFORM' || type === 'MAGAZINE') return 'serials'
  if (type === 'BRAND' || type === 'CIRCLE') return 'history'
  const games = data.galgames?.meta.total_items ?? 0
  const novels = data.light_novels?.items ?? []
  const mangas = data.mangas?.items ?? []
  if (type === 'COMPANY' && (novels.length || mangas.length) && !games) return 'hub'
  if (games) return 'history'
  if (mangas.some(item => item.codes.includes('MAGAZINE'))) return 'serials'
  if (novels.some(item => item.codes.includes('LABEL'))) return 'shelf'
  return novels.length || mangas.length ? 'hub' : 'history'
}

const groupOf = (work: OrgWork, label: (code: string) => string) =>
  work.kind === 'game'
    ? work.roles.map(role => ({ code: `game:${role}`, label: label(role) }))
    : [{ code: work.kind, label: work.kind === 'novel' ? '轻小说' : '漫画' }]

export function orgGroups(works: OrgWork[], label: (code: string) => string) {
  const counts = new Map<string, { code: string; label: string; count: number }>()
  for (const work of works)
    for (const group of groupOf(work, label)) {
      const entry = counts.get(group.code) ?? { ...group, count: 0 }
      entry.count++
      counts.set(group.code, entry)
    }
  return [...counts.values()].sort((a, b) => b.count - a.count)
}

export const inGroup = (work: OrgWork, code: string) =>
  code === 'ALL' ||
  (work.kind === 'game' ? work.roles.some(role => `game:${role}` === code) : work.kind === code)

export function sortWorks(works: OrgWork[], sort: string) {
  if (sort === 'old') return [...works].reverse()
  if (sort === 'rating')
    return [...works].sort(
      (a, b) =>
        (b.rating.average ?? -1) - (a.rating.average ?? -1) || b.rating.count - a.rating.count,
    )
  return works
}

export function averageRating(works: OrgWork[]) {
  const rated = works.filter(work => work.rating.average !== null && work.rating.count > 0)
  const count = rated.reduce((sum, work) => sum + work.rating.count, 0)
  if (!count) return null
  return (
    rated.reduce((sum, work) => sum + (work.rating.average ?? 0) * work.rating.count, 0) / count
  )
}

export function workMonth(date: string | null) {
  if (!date) return '日期不详'
  const [year, month, day] = date.split('-')
  const now = today()
  if (date <= now) return `${year} 年 ${Number(month)} 月`
  return year === now.slice(0, 4)
    ? `${Number(month)} 月 ${Number(day)} 日发售`
    : `${year} 年 ${Number(month)} 月发售`
}

export function establishedText(value: string | null, precision: string | null) {
  if (!value) return null
  const [year, month, day] = value.slice(0, 10).split('-')
  if (precision === 'YEAR' || !month) return `${year} 年`
  if (precision === 'MONTH' || !day) return `${year} 年 ${Number(month)} 月`
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`
}

export const peopleNames = (work: OrgWork, code: string) =>
  work.people
    .filter(person => person.code === code)
    .map(person => person.name)
    .join('、')
