import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
import { creditRoleLabel } from '~/features/entry/labels'
import { topVotedMedia } from '~/utils/media/image'

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

export function personWorks(data: PeoplePageData): PersonWork[] {
  const games = (data.galgames?.items ?? []).map(({ galgame, codes, rating }) => ({
    kind: 'game' as const,
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
  }))
  const novels = (data.light_novels?.items ?? []).map(({ light_novel, codes, rating }) => ({
    kind: 'novel' as const,
    id: light_novel.id,
    title: light_novel.name_cn || light_novel.name,
    original: light_novel.name,
    cover: topVotedMedia(light_novel.covers),
    date: light_novel.publication_date,
    by: light_novel.publishers[0]?.producer.name ?? null,
    roles: codes,
    rating,
  }))
  const mangas = (data.mangas?.items ?? []).map(({ manga, codes, rating }) => ({
    kind: 'manga' as const,
    id: manga.id,
    title: manga.name_cn || manga.name,
    original: manga.name,
    cover: topVotedMedia(manga.covers),
    date: manga.publication_date,
    by: null,
    roles: codes,
    rating,
  }))
  return [...games, ...novels, ...mangas].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export function voiceRoles(data: PeoplePageData) {
  return (data.characters?.items ?? []).map(({ character, galgames }) => ({
    id: character.id,
    name: character.trans_name || character.name,
    image: character.image,
    works: [...galgames].sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? '')),
  }))
}

export type VoiceRole = ReturnType<typeof voiceRoles>[number]

export function roleCounts(works: PersonWork[], voices: VoiceRole[]) {
  const counts = new Map<string, number>()
  if (voices.length) counts.set('VOICE', voices.length)
  for (const work of works)
    for (const role of work.roles) counts.set(role, (counts.get(role) ?? 0) + 1)
  return [...counts]
    .sort((a, b) => (a[0] === 'OTHER' ? 1 : b[0] === 'OTHER' ? -1 : b[1] - a[1]))
    .map(([code, count]) => ({ code, label: creditRoleLabel(code), count }))
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
