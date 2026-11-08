import type { components } from '@hikarinagi/api-contract/v3'
import { topVotedMedia } from '~/utils/media/image'

type Schemas = components['schemas']
type Cover = NonNullable<ReturnType<typeof topVotedMedia<{ src: string }>>>

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

export function orgWork(
  item: Schemas['EntityWorkDto'] &
    Partial<Pick<Schemas['ProducerWorkDto'], 'people' | 'volume_count'>>,
): OrgWork | null {
  const people = item.people ?? []
  const volumes = item.volume_count ?? null
  if (item.galgame)
    return {
      kind: 'game',
      id: item.galgame.id,
      title: item.galgame.trans_title || item.galgame.origin_title,
      original: item.galgame.origin_title,
      cover: topVotedMedia(item.galgame.covers),
      date: dayOf(item.galgame.release_date),
      roles: item.codes,
      rating: item.rating,
      volumes: null,
      label: null,
      people,
      authors: '',
    }
  if (item.light_novel)
    return {
      kind: 'novel',
      id: item.light_novel.id,
      title: item.light_novel.name_cn || item.light_novel.name,
      original: item.light_novel.name,
      cover: topVotedMedia(item.light_novel.covers),
      date: dayOf(item.light_novel.publication_date),
      roles: item.codes,
      rating: item.rating,
      volumes,
      label: item.light_novel.bunko,
      people: [],
      authors: item.light_novel.author?.name ?? '',
    }
  if (item.manga)
    return {
      kind: 'manga',
      id: item.manga.id,
      title: item.manga.name_cn || item.manga.name,
      original: item.manga.name,
      cover: topVotedMedia(item.manga.covers),
      date: dayOf(item.manga.publication_date),
      roles: item.codes,
      rating: item.rating,
      volumes,
      label: null,
      people,
      authors: people.map(person => person.name).join('、'),
    }
  return null
}

export const orgWorks = (items: Parameters<typeof orgWork>[0][]) =>
  items.flatMap(item => orgWork(item) ?? [])

export function orgMode(type: string | null, stats: Schemas['ProducerStatsDto']): OrgMode {
  if (type === 'LABEL') return 'shelf'
  if (type === 'PLATFORM' || type === 'MAGAZINE') return 'serials'
  if (type === 'BRAND' || type === 'CIRCLE') return 'history'
  const count = (kind: string) =>
    stats.groups.filter(group => group.kind === kind).reduce((sum, group) => sum + group.count, 0)
  const has = (kind: string, code: string) =>
    stats.codes.some(item => item.kind === kind && item.code === code)
  const books = count('light_novel') + count('manga')
  if (type === 'COMPANY' && books && !count('galgame')) return 'hub'
  if (count('galgame')) return 'history'
  if (has('manga', 'MAGAZINE')) return 'serials'
  if (has('light_novel', 'LABEL')) return 'shelf'
  return books ? 'hub' : 'history'
}

const groupCode = (group: { kind: string; code: string | null }) =>
  group.kind === 'galgame' ? `game:${group.code}` : group.kind === 'light_novel' ? 'novel' : 'manga'

export function orgGroups(stats: Schemas['ProducerStatsDto'], label: (code: string) => string) {
  return stats.groups.map(group => ({
    code: groupCode(group),
    label:
      group.kind === 'galgame'
        ? label(group.code ?? '')
        : group.kind === 'light_novel'
          ? '轻小说'
          : '漫画',
    count: group.count,
  }))
}

export function groupQuery(code: string) {
  if (code.startsWith('game:')) return { kind: 'galgame' as const, code: code.slice(5) }
  if (code === 'novel') return { kind: 'light_novel' as const }
  if (code === 'manga') return { kind: 'manga' as const }
  return {}
}

export function yearBuckets(stats: Schemas['ProducerStatsDto'], tab: string) {
  const counts = new Map<number, number>()
  for (const bucket of stats.years)
    if (tab === 'ALL' || groupCode(bucket) === tab)
      counts.set(bucket.year, (counts.get(bucket.year) ?? 0) + bucket.count)
  return [...counts].map(([year, count]) => ({ year, count })).sort((a, b) => a.year - b.year)
}

export function spanText(first: string | null, last: string | null) {
  return first && last ? `${first.slice(0, 4)} 年至 ${last.slice(0, 4)} 年` : null
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
