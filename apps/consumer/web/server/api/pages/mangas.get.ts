import { getQuery, type H3Event } from 'h3'
import { bannerForPosition, type PromoBanner } from '~/features/promotion/placement'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'
import { bucketSeed, pickRotating, seededShuffle } from '../../utils/rotation'

const HOT_SIZE = 10
const RAIL_SIZE = 8
const GRID_SIZE = 12
const BOARD_SIZE = 10
const SPOTLIGHT_POOL_SIZE = 30
const HERO_SLIDES = 5
const COLLECTION_COVERS = 3
const HOME_EXCLUDE_REGIONS: ('kr' | 'western')[] = ['kr', 'western']

type MangaListItem = Awaited<ReturnType<typeof fetchUpdatesPage>>['items'][number]

interface HeroSlide {
  source: 'featured' | 'spotlight' | 'hot'
  rank: number | null
  manga: MangaListItem
  title: string | null
  kicker: string | null
  intro: string | null
  magazine: string | null
}

type HeroBase = {
  source: HeroSlide['source']
  rank: number | null
  manga: MangaListItem
  title: string | null
  kicker: string | null
  intro: string | null
}

async function buildHeroSlides(
  event: H3Event,
  featured: HeroBase[],
  spotlight: MangaListItem | null,
  hot: MangaListItem[],
): Promise<HeroSlide[]> {
  const bases: HeroBase[] = [...featured]
  const used = new Set(bases.map(base => base.manga.id))

  if (
    bases.length < HERO_SLIDES &&
    spotlight &&
    spotlight.covers.length > 0 &&
    !used.has(spotlight.id)
  ) {
    bases.push({
      source: 'spotlight',
      rank: null,
      manga: spotlight,
      title: null,
      kicker: null,
      intro: null,
    })
    used.add(spotlight.id)
  }

  for (const [index, manga] of hot.entries()) {
    if (bases.length >= HERO_SLIDES) break
    if (!manga.covers.length || used.has(manga.id)) continue
    bases.push({
      source: 'hot',
      rank: index + 1,
      manga,
      title: null,
      kicker: null,
      intro: null,
    })
    used.add(manga.id)
  }

  return Promise.all(
    bases.map(async base => {
      const [detail, producers] = await Promise.all([
        fetchBackendData(event, '/api/v3/mangas/{id}', { path: { id: base.manga.id } }).catch(
          () => null,
        ),
        fetchBackendData(event, '/api/v3/mangas/{id}/producers', {
          path: { id: base.manga.id },
        }).catch(() => null),
      ])
      return {
        ...base,
        intro: base.intro || detail?.summary_cn || detail?.summary || null,
        magazine: producers?.find(item => item.role === 'MAGAZINE')?.producer.name ?? null,
      }
    }),
  )
}

async function fetchUpdatesPage(event: H3Event, page: number) {
  const res = await fetchBackendData(event, '/api/v3/mangas', {
    query: {
      exclude_regions: HOME_EXCLUDE_REGIONS,
      sort_field: 'publication_date',
      sort_order: 'desc',
      released: true,
      has_linked_source: true,
      min_heat: 1,
      page,
      page_size: GRID_SIZE,
    },
  })

  return {
    items: res.items,
    total: res.meta.total_items,
    next_cursor: res.meta.page < res.meta.total_pages ? res.meta.page + 1 : null,
  }
}

const STREAM_DECADES = [
  { key: '2010s', title: '2010 年代' },
  { key: '2000s', title: '2000 年代' },
  { key: 'earlier', title: '更早的经典' },
] as const
const STREAM_RAIL_SIZE = 10
const STREAM_FAMILIES = 6
const BANNER_EVERY = 5
const FEATURE_BASE_RANK = 20
const FEATURE_POOL = 30

type StreamModule =
  | {
      kind: 'rail'
      title: string
      meta: string
      to: string
      ranked: boolean
      items: MangaListItem[]
    }
  | { kind: 'grid'; title: string; meta: string; to: string; items: MangaListItem[] }
  | {
      kind: 'collections'
      entries: { title: string; total: number; covers: MangaListItem[]; to: string }[]
    }
  | { kind: 'feature'; item: MangaListItem; intro: string | null }
  | { kind: 'banner'; banner: PromoBanner }

function rotated<T>(pool: readonly T[], salt: string): T[] {
  return seededShuffle(pool, bucketSeed(salt, 60))
}

const KANA_PATTERN = /[぀-ヿ]/

interface StreamPools {
  genres: { key: string; name: string }[]
  magazines: { id: number; name: string }[]
}

async function fetchStreamPools(event: H3Event): Promise<StreamPools> {
  const stats = await fetchBackendData(event, '/api/v3/mangas/stats').catch(() => null)
  if (!stats) return { genres: [], magazines: [] }
  const genres = stats.top_genres.slice(0, 24).map(genre => ({ key: genre.key, name: genre.name }))
  const magazines = stats.top_magazines
    .filter(magazine => KANA_PATTERN.test(magazine.name))
    .slice(0, 12)
    .map(magazine => ({ id: magazine.id, name: magazine.name }))
  return {
    genres,
    magazines: magazines.length >= 4 ? magazines : [],
  }
}

async function fetchRankedList(
  event: H3Event,
  query: Record<string, string | number>,
  page: number,
  pageSize: number,
) {
  return fetchBackendData(event, '/api/v3/mangas', {
    query: {
      exclude_regions: HOME_EXCLUDE_REGIONS,
      has_linked_source: true,
      ...query,
      sort_field: 'heat',
      sort_order: 'desc',
      page,
      page_size: pageSize,
    },
  })
}

async function fetchExtraModule(
  event: H3Event,
  step: number,
  pools: StreamPools,
): Promise<StreamModule | null> {
  const family = step % STREAM_FAMILIES
  const familyStep = Math.floor(step / STREAM_FAMILIES)

  if (family === 0 || family === 3) {
    const pool = rotated(pools.genres, family === 0 ? 'manga-rail-genre' : 'manga-grid-genre')
    if (!pool.length) return null
    const genre = pool[familyStep % pool.length]!
    const page = Math.floor(familyStep / pool.length) + 1
    const size = family === 0 ? STREAM_RAIL_SIZE : GRID_SIZE
    const res = await fetchRankedList(
      event,
      { genre: genre.key, region: 'jp', decade: '2020s' },
      page,
      size,
    )
    if (!res.items.length) return null
    const shared = {
      title: genre.name,
      meta: `${res.meta.total_items} 部`,
      to: `/mangas/browse?genre=${genre.key}&sort=heat:desc`,
      items: res.items,
    }
    return family === 0 ? { kind: 'rail', ranked: false, ...shared } : { kind: 'grid', ...shared }
  }
  if (family === 1) {
    const pool = rotated(pools.magazines, 'manga-rail-magazine')
    if (!pool.length) return null
    const magazine = pool[familyStep % pool.length]!
    const page = Math.floor(familyStep / pool.length) + 1
    const res = await fetchBackendData(event, '/api/v3/mangas', {
      query: {
        exclude_regions: HOME_EXCLUDE_REGIONS,
        has_linked_source: true,
        magazine_id: magazine.id,
        sort_field: 'latest_chapter_at',
        sort_order: 'desc',
        page,
        page_size: STREAM_RAIL_SIZE,
      },
    })
    if (!res.items.length) return null
    return {
      kind: 'rail',
      ranked: false,
      title: magazine.name,
      meta: `${res.meta.total_items} 部`,
      to: `/mangas/browse?magazine_id=${magazine.id}`,
      items: res.items,
    }
  }
  if (family === 2) {
    const pool = rotated(STREAM_DECADES, 'manga-rail-decade')
    const decade = pool[familyStep % pool.length]!
    const page = Math.floor(familyStep / pool.length) + 1
    const res = await fetchRankedList(
      event,
      { decade: decade.key, region: 'cjk' },
      page,
      STREAM_RAIL_SIZE,
    )
    if (!res.items.length) return null
    return {
      kind: 'rail',
      ranked: page === 1,
      title: decade.title,
      meta: '当年的高分作',
      to: `/mangas/browse?decade=${decade.key}&sort=heat:desc`,
      items: res.items,
    }
  }
  if (family === 4) {
    const pool = rotated(pools.genres, 'manga-coll-genre')
    if (pool.length < 4) return null
    const railPool = rotated(pools.genres, 'manga-rail-genre')
    const gridPool = rotated(pools.genres, 'manga-grid-genre')
    const near = new Set([
      railPool[familyStep % railPool.length],
      railPool[(familyStep + 1) % railPool.length],
      gridPool[familyStep % gridPool.length],
    ])
    const candidates = pool.filter(genre => !near.has(genre))
    const picks = Array.from(
      { length: 4 },
      (_, i) => candidates[(familyStep * 4 + i) % candidates.length]!,
    )
    const results = await Promise.all(
      picks.map(genre =>
        fetchRankedList(event, { genre: genre.key }, 1, COLLECTION_COVERS).catch(() => null),
      ),
    )
    const entries = picks.flatMap((genre, i) => {
      const res = results[i]
      if (!res || !res.items.length) return []
      return [
        {
          title: genre.name,
          total: res.meta.total_items,
          covers: res.items,
          to: `/mangas/browse?genre=${genre.key}&sort=heat:desc`,
        },
      ]
    })
    if (entries.length < 4) return null
    return { kind: 'collections', entries }
  }
  const rank = FEATURE_BASE_RANK + (familyStep % FEATURE_POOL)
  const res = await fetchRankedList(event, { serial_status: 'FINISHED', region: 'cjk' }, rank, 1)
  const item = res.items[0]
  if (!item) return null
  const detail = await fetchBackendData(event, '/api/v3/mangas/{id}', {
    path: { id: item.id },
  }).catch(() => null)
  return { kind: 'feature', item, intro: detail?.summary_cn || detail?.summary || null }
}

async function fetchStreamBatch(event: H3Event, cursor: number) {
  const step = cursor - 2
  const wantBanner = step > 0 && step % BANNER_EVERY === 0
  const pools = await fetchStreamPools(event)
  const [updates, extra, banners] = await Promise.all([
    fetchUpdatesPage(event, cursor),
    fetchExtraModule(event, step, pools).catch(() => null),
    wantBanner
      ? fetchBackendData(event, '/api/v3/promotions/banners', {
          query: { surface: 'MANGA_FEED' },
        }).catch(() => [] as PromoBanner[])
      : Promise.resolve([] as PromoBanner[]),
  ])
  const modules: StreamModule[] = []
  const banner = bannerForPosition(step, banners, BANNER_EVERY)
  if (banner) modules.push({ kind: 'banner', banner })
  if (extra) modules.push(extra)
  if (updates.items.length) {
    modules.push({ kind: 'grid', title: '', meta: '', to: '', items: updates.items })
  }
  return { modules, next_cursor: updates.next_cursor }
}

async function fetchFeaturedSlides(event: H3Event): Promise<HeroBase[]> {
  const slots = await fetchBackendData(event, '/api/v3/mangas/featured').catch(() => [])
  return slots
    .filter(slot => slot.manga.covers.length > 0)
    .slice(0, HERO_SLIDES)
    .map(slot => ({
      source: 'featured' as const,
      rank: null,
      manga: slot.manga,
      title: slot.title ?? null,
      kicker: slot.kicker ?? null,
      intro: slot.intro ?? null,
    }))
}

async function buildHome(event: H3Event) {
  const pools = await fetchStreamPools(event)
  const [primaryMagazine] = pickRotating(pools.magazines, 1, 'manga-home-magazine', 30)
  const collectionGenres = pickRotating(pools.genres, 4, 'manga-home-collection', 30)

  const [updates, serialRank, fresh, magazineRail, finishedRank, genreCollections, featured] =
    await Promise.all([
      fetchUpdatesPage(event, 1),
      fetchBackendData(event, '/api/v3/mangas', {
        query: {
          exclude_regions: HOME_EXCLUDE_REGIONS,
          has_linked_source: true,
          sort_field: 'heat',
          sort_order: 'desc',
          serial_status: 'SERIALIZING',
          region: 'jp',
          decade: '2020s',
          page: 1,
          page_size: BOARD_SIZE,
        },
      }),
      fetchBackendData(event, '/api/v3/mangas', {
        query: {
          exclude_regions: HOME_EXCLUDE_REGIONS,
          has_linked_source: true,
          sort_field: 'publication_date',
          sort_order: 'desc',
          region: 'jp',
          released: true,
          page: 1,
          page_size: RAIL_SIZE,
        },
      }),
      fetchBackendData(event, '/api/v3/mangas', {
        query: {
          exclude_regions: HOME_EXCLUDE_REGIONS,
          has_linked_source: true,
          magazine_id: primaryMagazine?.id,
          sort_field: 'latest_chapter_at',
          sort_order: 'desc',
          page: 1,
          page_size: RAIL_SIZE,
        },
      }),
      fetchBackendData(event, '/api/v3/mangas', {
        query: {
          exclude_regions: HOME_EXCLUDE_REGIONS,
          has_linked_source: true,
          sort_field: 'heat',
          sort_order: 'desc',
          serial_status: 'FINISHED',
          page: 1,
          page_size: SPOTLIGHT_POOL_SIZE,
        },
      }),
      Promise.all(
        collectionGenres.map(genre =>
          fetchRankedList(event, { genre: genre.key }, 1, COLLECTION_COVERS).catch(() => null),
        ),
      ),
      fetchFeaturedSlides(event),
    ])

  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86_400_000)
  const spotlightPool = finishedRank.items
  const spotlight = spotlightPool[dayOfYear % spotlightPool.length] ?? null

  return {
    hero: { slides: await buildHeroSlides(event, featured, spotlight, serialRank.items) },
    hot: serialRank.items.slice(0, HOT_SIZE),
    updates,
    board: {
      serializing: serialRank.items,
      finished: finishedRank.items.slice(0, BOARD_SIZE),
    },
    fresh: fresh.items,
    magazine: primaryMagazine
      ? {
          id: primaryMagazine.id,
          name: primaryMagazine.name,
          total: magazineRail.meta.total_items,
          items: magazineRail.items,
        }
      : null,
    finished: finishedRank.items.slice(BOARD_SIZE, BOARD_SIZE + RAIL_SIZE),
    collections: collectionGenres.flatMap((genre, index) => {
      const res = genreCollections[index]
      if (!res || !res.items.length) return []
      return [
        {
          title: genre.name,
          total: res.meta.total_items,
          covers: res.items,
          to: `/mangas/browse?genre=${genre.key}&sort=heat:desc`,
        },
      ]
    }),
  }
}

async function handler(event: H3Event) {
  const cursor = Math.floor(Number(getQuery(event).cursor) || 0)
  if (cursor > 1) return fetchStreamBatch(event, cursor)

  return buildHome(event)
}

export type MangaHomePageData = Awaited<ReturnType<typeof buildHome>>
export type MangaStreamBatch = Awaited<ReturnType<typeof fetchStreamBatch>>
export default definePageBffHandler(handler)
