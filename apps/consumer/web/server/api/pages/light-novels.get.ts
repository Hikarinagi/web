import type { H3Event } from 'h3'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'
import { bucketSeed, pickN, pickOne } from '../../utils/rotation'

const RAIL_SIZE = 18
const ROW_SIZE = 12

// spotlight 走通用关系端点(不能全局要求封面),首页这里剔掉关联作品无封面的项。
function worksWithCover<W extends { items: Array<{ light_novel: { covers: unknown[] } }> } | null>(
  works: W,
): W {
  return works
    ? ({ ...works, items: works.items.filter(w => w.light_novel.covers.length > 0) } as W)
    : works
}

async function handler(event: H3Event) {
  const today = new Date().toISOString().slice(0, 10)

  // Wave 1:固定区块(排行榜/即将发售/最新收录)+ 轮换 rail 的「候选 id 列表」(均可缓存)
  const [
    stats,
    ranking,
    upcoming,
    recent,
    readableCandidates,
    shortCandidates,
    completedCandidates,
  ] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/stats'),
    fetchBackendData(event, '/api/v3/light-novels', {
      query: { sort_field: 'views', sort_order: 'desc', page: 1, page_size: 10, has_cover: true },
    }),
    fetchBackendData(event, '/api/v3/light-novels', {
      query: {
        publication_from: today,
        sort_field: 'publication_date',
        sort_order: 'asc',
        page: 1,
        page_size: RAIL_SIZE,
        has_cover: true,
      },
    }),
    fetchBackendData(event, '/api/v3/light-novels', {
      query: {
        publication_to: today,
        sort_field: 'publication_date',
        sort_order: 'desc',
        page: 1,
        page_size: ROW_SIZE,
        has_cover: true,
      },
    }),
    fetchBackendData(event, '/api/v3/light-novels/candidates', {
      query: { novel_status: 'FINISHED', readable: true, has_cover: true },
    }),
    fetchBackendData(event, '/api/v3/light-novels/candidates', {
      query: { volume_min: 1, volume_max: 3, has_cover: true },
    }),
    fetchBackendData(event, '/api/v3/light-novels/candidates', {
      query: { novel_status: 'FINISHED', has_cover: true },
    }),
  ])

  const heroId =
    readableCandidates.ids[Math.floor(Math.random() * readableCandidates.ids.length)] ?? null
  const readablePool = readableCandidates.ids.filter((id: number) => id !== heroId)
  const readablePick = pickN(readablePool, RAIL_SIZE, bucketSeed('readable'))
  const readableHydrationIds = heroId ? [heroId, ...readablePick] : readablePick
  const shortPick = pickN(shortCandidates.ids, RAIL_SIZE, bucketSeed('short'))
  const completedPick = pickN(completedCandidates.ids, RAIL_SIZE, bucketSeed('completed'))
  const authorId = pickOne(stats.spotlight.author_ids, bucketSeed('author'))
  const seriesId = pickOne(stats.spotlight.series_ids, bucketSeed('series'))
  const bunkoPick = pickN(stats.top_bunko, 2, bucketSeed('bunko'))
  const bunkoA = bunkoPick[0] ?? null
  const bunkoB = bunkoPick[1] ?? null

  // Wave 2:水合选中的 K 条(by-ids 保序)+ spotlight/文库 详情
  const [
    readableItems,
    heroDetail,
    heroVolumes,
    shortItems,
    completedItems,
    authorPerson,
    authorWorks,
    bunkoWorksA,
    bunkoWorksB,
    seriesDetail,
    seriesRelations,
  ] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/by-ids', {
      query: { ids: readableHydrationIds },
    }),
    heroId
      ? fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id: heroId } }).catch(
          () => null,
        )
      : null,
    heroId
      ? fetchBackendData(event, '/api/v3/light-novels/{id}/volumes', {
          path: { id: heroId },
        }).catch(() => null)
      : null,
    fetchBackendData(event, '/api/v3/light-novels/by-ids', { query: { ids: shortPick } }),
    fetchBackendData(event, '/api/v3/light-novels/by-ids', { query: { ids: completedPick } }),
    authorId
      ? fetchBackendData(event, '/api/v3/people/{id}', { path: { id: authorId } }).catch(() => null)
      : null,
    authorId
      ? fetchBackendData(event, '/api/v3/people/{id}/light-novels', {
          path: { id: authorId },
          query: { relation: 'author', sort: 'recent', page: 1, page_size: ROW_SIZE },
        }).catch(() => null)
      : null,
    bunkoA
      ? fetchBackendData(event, '/api/v3/producers/{id}/light-novels', {
          path: { id: bunkoA.id },
          query: { relation: 'bunko', sort: 'recent', page: 1, page_size: ROW_SIZE },
        }).catch(() => null)
      : null,
    bunkoB
      ? fetchBackendData(event, '/api/v3/producers/{id}/light-novels', {
          path: { id: bunkoB.id },
          query: { relation: 'bunko', sort: 'recent', page: 1, page_size: ROW_SIZE },
        }).catch(() => null)
      : null,
    seriesId
      ? fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id: seriesId } }).catch(
          () => null,
        )
      : null,
    seriesId
      ? fetchBackendData(event, '/api/v3/light-novels/{id}/relations', {
          path: { id: seriesId },
        }).catch(() => null)
      : null,
  ])

  const bunko_picks = [
    bunkoA && bunkoWorksA ? { bunko: bunkoA, works: worksWithCover(bunkoWorksA) } : null,
    bunkoB && bunkoWorksB ? { bunko: bunkoB, works: worksWithCover(bunkoWorksB) } : null,
  ].filter((pick): pick is NonNullable<typeof pick> => pick !== null)

  const heroItem = heroId ? (readableItems.find(item => item.id === heroId) ?? null) : null
  const hero =
    heroItem && heroDetail && heroVolumes
      ? {
          item: heroItem,
          detail: heroDetail,
          volumes: heroVolumes,
          candidate_ids: readableCandidates.ids.filter((id: number) => !readablePick.includes(id)),
        }
      : null
  const { top_tags, ...pageStats } = stats

  return {
    hero,
    stats: pageStats,
    completed_readable: {
      items: readableItems.filter(item => item.id !== heroId).slice(0, RAIL_SIZE),
    },
    ranking,
    short_series: { items: shortItems },
    completed: { items: completedItems },
    upcoming,
    recent,
    author_spotlight:
      authorPerson && authorWorks
        ? { person: authorPerson, works: worksWithCover(authorWorks) }
        : null,
    bunko_picks,
    series_spotlight:
      seriesDetail && seriesRelations
        ? {
            series: seriesDetail,
            relations: seriesRelations.filter(r => r.target_light_novel.covers.length > 0),
          }
        : null,
  }
}

export type LightNovelsLandingData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
