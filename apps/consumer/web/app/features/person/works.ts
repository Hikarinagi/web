import type { components } from '@hikarinagi/api-contract/v3'
import { creditRoleLabel } from '~/features/entry/labels'
import { topVotedMedia } from '~/utils/media/image'

type Schemas = components['schemas']
type Media = NonNullable<ReturnType<typeof topVotedMedia<{ src: string }>>>

export type WorkKind = 'game' | 'novel' | 'manga'

export interface PersonWork {
  kind: WorkKind
  id: number
  title: string
  original: string
  cover: Media | null
  date: string | null
  by: string | null
  roles: string[]
  rating: { average: number | null; count: number }
}

export const KIND_LABELS: Record<WorkKind, string> = {
  game: '游戏',
  novel: '轻小说',
  manga: '漫画',
}

export const KIND_PATHS: Record<WorkKind, string> = {
  game: 'galgames',
  novel: 'light-novels',
  manga: 'mangas',
}

export const yearOf = (date: string | null | undefined) => date?.slice(0, 4) ?? '年份不详'

export function personWork({
  galgame,
  light_novel,
  manga,
  codes,
  rating,
}: Schemas['EntityWorkDto']): PersonWork | null {
  if (galgame)
    return {
      kind: 'game',
      id: galgame.id,
      title: galgame.trans_title || galgame.origin_title,
      original: galgame.origin_title,
      cover: topVotedMedia(galgame.covers),
      date: galgame.release_date,
      by:
        galgame.producers.find(item => item.role === 'DEVELOPER')?.producer.name ??
        galgame.producers[0]?.producer.name ??
        null,
      roles: codes,
      rating,
    }
  if (light_novel)
    return {
      kind: 'novel',
      id: light_novel.id,
      title: light_novel.name_cn || light_novel.name,
      original: light_novel.name,
      cover: topVotedMedia(light_novel.covers),
      date: light_novel.publication_date,
      by: light_novel.publishers[0]?.producer.name ?? null,
      roles: codes,
      rating,
    }
  if (manga)
    return {
      kind: 'manga',
      id: manga.id,
      title: manga.name_cn || manga.name,
      original: manga.name,
      cover: topVotedMedia(manga.covers),
      date: manga.publication_date,
      by: null,
      roles: codes,
      rating,
    }
  return null
}

export const personWorks = (items: Schemas['EntityWorkDto'][]) =>
  items.flatMap(item => personWork(item) ?? [])

export function voiceRoles(items: Schemas['PersonCharacterRelationDto'][]) {
  return items.map(({ character, galgames }) => ({
    id: character.id,
    name: character.trans_name || character.name,
    image: character.image,
    works: [...galgames].sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? '')),
  }))
}

export type VoiceRole = ReturnType<typeof voiceRoles>[number]

export function roleCounts(stats: Schemas['PersonStatsDto']) {
  return [...(stats.voices ? [{ code: 'VOICE', count: stats.voices }] : []), ...stats.roles]
    .sort((a, b) => (a.code === 'OTHER' ? 1 : b.code === 'OTHER' ? -1 : b.count - a.count))
    .map(({ code, count }) => ({ code, label: creditRoleLabel(code), count }))
}

export function workYears(stats: Schemas['PersonStatsDto']) {
  const first = stats.first_date?.slice(0, 4)
  const last = stats.last_date?.slice(0, 4)
  return first && last ? `${first} 年至 ${last} 年` : null
}

export interface KnownItem {
  key: string
  to: string
  image: VoiceRole['image'] | Media | null
  title: string
  sub: string
  year: string
  rating: { average: number | null; count: number }
  portrait: boolean
  book: boolean
}

export function knownWorks(works: PersonWork[], voices: VoiceRole[]) {
  const byWork = works
    .filter(work => work.cover)
    .map(work => ({
      count: work.rating.count,
      date: work.date ?? '',
      item: {
        key: `w${work.kind}${work.id}`,
        to: `/${KIND_PATHS[work.kind]}/${work.id}`,
        image: work.cover,
        title: work.title,
        sub: work.roles.map(creditRoleLabel).join('、'),
        year: yearOf(work.date),
        rating: work.rating,
        portrait: false,
        book: work.kind !== 'game',
      } satisfies KnownItem,
    }))
  const byVoice = voices.flatMap(voice => {
    const top = [...voice.works].sort((a, b) => b.rating.count - a.rating.count)[0]
    if (!top) return []
    return [
      {
        count: top.rating.count,
        date: top.release_date ?? '',
        item: {
          key: `v${voice.id}`,
          to: `/galgames/${top.id}`,
          image: voice.image,
          title: voice.name,
          sub: top.trans_title || top.origin_title,
          year: yearOf(top.release_date),
          rating: top.rating,
          portrait: true,
          book: false,
        } satisfies KnownItem,
      },
    ]
  })
  return [...byVoice, ...byWork]
    .sort((a, b) => b.count - a.count || b.date.localeCompare(a.date))
    .slice(0, 4)
    .map(entry => entry.item)
}
