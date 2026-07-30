import { getQuery, type H3Event } from 'h3'
import type { SeriesCardItem } from '~/features/light-novel/explore'
import { bannerForPosition, type PromoBanner } from '~/features/promotion/placement'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { bucketSeed, pickN, pickRotating, seededShuffle } from '../../../utils/rotation'

const RAIL_SIZE = 18
const BATCH = 3 // 每次滚动注入几条 rail
const BANNER_EVERY = 5 // 每 5 条 rail 插一个运营 banner(全局 rail 序号计)

type RailEntry = ({ kind: 'rail' } & Rail) | { kind: 'banner'; key: string; banner: PromoBanner }

type RailSpec =
  | { type: 'tag'; id: number; name: string; count: number }
  | { type: 'author'; id: number }
  | { type: 'bunko'; id: number; name: string }
  | { type: 'series'; id: number }

type Rail = {
  key: string
  title: string
  meta: string
  to?: string
  items: SeriesCardItem[]
}

async function handler(event: H3Event) {
  const cursor = Math.max(0, Number(getQuery(event).cursor) || 0)
  const stats = await fetchBackendData(event, '/api/v3/light-novels/stats')

  // 首屏已用掉的(landing BFF 用同样的种子选),无限流里排除避免重复
  const firstAuthor = pickN(stats.spotlight.author_ids, 1, bucketSeed('author'))[0]
  const firstSeries = pickN(stats.spotlight.series_ids, 1, bucketSeed('series'))[0]
  const firstBunko = new Set(pickN(stats.top_bunko, 2, bucketSeed('bunko')).map(b => b.id))

  // 各池按桶种子定序(同窗稳定 → cursor 稳定;跨窗轮换)
  const tagSpecs: RailSpec[] = seededShuffle(stats.top_tags, bucketSeed('rail-tag')).map(t => ({
    type: 'tag',
    id: t.id,
    name: t.name,
    count: t.count,
  }))
  const authorSpecs: RailSpec[] = seededShuffle(
    stats.spotlight.author_ids.filter(id => id !== firstAuthor),
    bucketSeed('rail-author'),
  ).map(id => ({ type: 'author', id }))
  const bunkoSpecs: RailSpec[] = seededShuffle(
    stats.top_bunko.filter(b => !firstBunko.has(b.id)),
    bucketSeed('rail-bunko'),
  ).map(b => ({ type: 'bunko', id: b.id, name: b.name }))
  const seriesSpecs: RailSpec[] = seededShuffle(
    stats.spotlight.series_ids.filter(id => id !== firstSeries),
    bucketSeed('rail-series'),
  ).map(id => ({ type: 'series', id }))

  // 非标签泳道轮流(作者→文库→系列),整体以标签为主、每第 4 条插一条非标签
  const nonTags: RailSpec[] = []
  const queues = [authorSpecs, bunkoSpecs, seriesSpecs]
  for (let qi = 0; queues.some(q => q.length); qi += 1) {
    const q = queues[qi % 3]!
    if (q.length) nonTags.push(q.shift()!)
  }
  // 标签为主:每第 4 条插一条非标签;标签用尽即收尾(尾部不堆剩余非标签)
  const specs: RailSpec[] = []
  let ti = 0
  let ni = 0
  for (let pos = 0; ti < tagSpecs.length; pos += 1) {
    if (pos % 4 === 3 && ni < nonTags.length) specs.push(nonTags[ni++]!)
    else specs.push(tagSpecs[ti++]!)
  }

  const start = cursor * BATCH
  const batch = specs.slice(start, start + BATCH)
  const next_cursor = start + BATCH < specs.length ? cursor + 1 : null

  const built = await Promise.all(batch.map(spec => buildRail(event, spec)))

  const hasSlot = batch.some((_, i) => start + i > 0 && (start + i) % BANNER_EVERY === 0)
  const banners = hasSlot
    ? await fetchBackendData(event, '/api/v3/promotions/banners', {
        query: { surface: 'LIGHT_NOVEL_FEED' },
      }).catch(() => [] as PromoBanner[])
    : []

  const entries: RailEntry[] = []
  built.forEach((rail, i) => {
    const banner = bannerForPosition(start + i, banners, BANNER_EVERY)
    if (banner) entries.push({ kind: 'banner', key: `banner-${start + i}`, banner })
    if (rail) entries.push({ kind: 'rail', ...rail })
  })

  return { entries, next_cursor }
}

async function buildRail(event: H3Event, spec: RailSpec): Promise<Rail | null> {
  if (spec.type === 'tag') {
    const cand = await fetchBackendData(event, '/api/v3/light-novels/candidates', {
      query: { tag_id: spec.id },
    }).catch(() => null)
    if (!cand) return null
    // 整窗平移:同一标签每次访问取到尽量不同的一批(相邻窗口零重叠直到绕回)
    const ids = pickRotating(cand.ids, RAIL_SIZE, `tag:${spec.id}`)
    const items = await fetchBackendData(event, '/api/v3/light-novels/by-ids', {
      query: { ids },
    }).catch(() => null)
    if (!items || !items.length) return null
    return {
      key: `tag-${spec.id}`,
      title: `#${spec.name}`,
      meta: `${spec.count} 部`,
      to: `/light-novels/browse?tag_groups=include.and.${spec.id}`,
      items,
    }
  }

  if (spec.type === 'author') {
    const works = await fetchBackendData(event, '/api/v3/people/{id}/light-novels', {
      path: { id: spec.id },
      query: { relation: 'author', sort: 'recent', page: 1, page_size: RAIL_SIZE },
    }).catch(() => null)
    if (!works || !works.items.length) return null
    const name = works.items[0]!.light_novel.author?.name ?? '作者'
    return {
      key: `author-${spec.id}`,
      title: `作者 · ${name}`,
      meta: `${works.meta.total_items} 部`,
      to: `/light-novels/author/${spec.id}`,
      items: works.items.map(row => row.light_novel),
    }
  }

  if (spec.type === 'bunko') {
    const works = await fetchBackendData(event, '/api/v3/producers/{id}/light-novels', {
      path: { id: spec.id },
      query: { relation: 'bunko', sort: 'recent', page: 1, page_size: RAIL_SIZE },
    }).catch(() => null)
    if (!works || !works.items.length) return null
    return {
      key: `bunko-${spec.id}`,
      title: `文库 · ${spec.name}`,
      meta: `${works.meta.total_items} 部`,
      to: `/light-novels/browse?bunko_id=${spec.id}`,
      items: works.items.map(row => row.light_novel),
    }
  }

  const [detail, relations] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id: spec.id } }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/light-novels/{id}/relations', {
      path: { id: spec.id },
    }).catch(() => null),
  ])
  if (!detail || !relations || !relations.length) return null
  return {
    key: `series-${spec.id}`,
    title: `系列 · ${detail.name_cn || detail.name}`,
    meta: '本传 / 续作 / 外传 / 联动',
    to: `/light-novels/${spec.id}`,
    items: [detail, ...relations.map(rel => rel.target_light_novel)],
  }
}

export type LightNovelRailsData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
