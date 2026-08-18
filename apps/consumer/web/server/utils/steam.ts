export interface SteamLanguage {
  name: string
  full_audio: boolean
}

export interface SteamAppSummary {
  app_id: number
  name: string
  url: string
  header_image: string
  short_description: string
  release_date: string
  developers: string[]
  publishers: string[]
  languages: SteamLanguage[]
  platforms: string[]
  achievements: number
  has_demo: boolean
  is_free: boolean
  region_locked: boolean
  price: { final: string; original: string; discount_percent: number } | null
  review: { desc: string; percent: number; total: number } | null
}

interface SteamAppDetails {
  success?: boolean
  data?: {
    name?: string
    header_image?: string
    short_description?: string
    supported_languages?: string
    is_free?: boolean
    developers?: string[]
    publishers?: string[]
    demos?: unknown[]
    achievements?: { total?: number }
    platforms?: { windows?: boolean; mac?: boolean; linux?: boolean }
    release_date?: { coming_soon?: boolean; date?: string }
    price_overview?: {
      final_formatted?: string
      initial_formatted?: string
      discount_percent?: number
    }
  }
}

interface SteamReviewSummary {
  query_summary?: {
    review_score_desc?: string
    total_positive?: number
    total_reviews?: number
  }
}

const MAX_APPS = 10
const HOME_COUNTRY = 'cn'
const FALLBACK_COUNTRY = 'us'
const PLATFORM_LABELS: [
  keyof NonNullable<NonNullable<SteamAppDetails['data']>['platforms']>,
  string,
][] = [
  ['windows', 'Windows'],
  ['mac', 'macOS'],
  ['linux', 'Linux'],
]

function parseLanguages(input: string | undefined): SteamLanguage[] {
  if (!input) return []

  return (input.split(/<br\s*\/?>/i)[0] ?? '')
    .split(',')
    .map(part => ({
      name: part
        .replace(/<[^>]*>/g, '')
        .replace(/\*/g, '')
        .trim(),
      full_audio: /<strong>\s*\*\s*<\/strong>/i.test(part),
    }))
    .filter(language => language.name.length > 0)
}

async function fetchReview(appId: number): Promise<SteamAppSummary['review']> {
  const payload = await $fetch<SteamReviewSummary>(
    `https://store.steampowered.com/appreviews/${appId}`,
    {
      query: { json: 1, language: 'all', purchase_type: 'all', num_per_page: 0, l: 'schinese' },
      timeout: 8_000,
    },
  )

  const summary = payload?.query_summary
  const total = summary?.total_reviews ?? 0
  if (!summary?.review_score_desc || total <= 0) return null

  return {
    desc: summary.review_score_desc,
    percent: Math.round(((summary.total_positive ?? 0) / total) * 100),
    total,
  }
}

async function fetchDetails(appId: number, country: string) {
  const payload = await $fetch<Record<string, SteamAppDetails>>(
    'https://store.steampowered.com/api/appdetails',
    { query: { appids: appId, l: 'schinese', cc: country }, timeout: 8_000 },
  )

  return payload?.[String(appId)]
}

const cachedApp = defineCachedFunction(
  async (appId: number): Promise<SteamAppSummary | null> => {
    const [local, review] = await Promise.all([
      fetchDetails(appId, HOME_COUNTRY).catch(() => null),
      fetchReview(appId).catch(() => null),
    ])

    const detail = local?.success ? local : await fetchDetails(appId, FALLBACK_COUNTRY)
    const regionLocked = !local?.success && Boolean(detail?.success)

    const data = detail?.data
    const name = data?.name
    if (!detail?.success || !data || !name) return null

    const price = regionLocked ? undefined : data.price_overview

    return {
      app_id: appId,
      name,
      url: `https://store.steampowered.com/app/${appId}/`,
      header_image: data.header_image ?? '',
      short_description: data.short_description ?? '',
      release_date: data.release_date?.coming_soon ? '即将推出' : (data.release_date?.date ?? ''),
      developers: data.developers ?? [],
      publishers: data.publishers ?? [],
      languages: parseLanguages(data.supported_languages),
      platforms: PLATFORM_LABELS.filter(([key]) => data.platforms?.[key]).map(([, label]) => label),
      achievements: data.achievements?.total ?? 0,
      has_demo: (data.demos?.length ?? 0) > 0,
      is_free: data.is_free === true,
      region_locked: regionLocked,
      price: price?.final_formatted
        ? {
            final: price.final_formatted,
            original: price.initial_formatted ?? '',
            discount_percent: price.discount_percent ?? 0,
          }
        : null,
      review,
    }
  },
  {
    name: 'steam-app',
    maxAge: 60 * 60 * 6,
    swr: true,
    getKey: (appId: number) => String(appId),
  },
)

export async function steamApps(appIds: number[]): Promise<SteamAppSummary[]> {
  const unique = [...new Set(appIds.filter(id => Number.isSafeInteger(id) && id > 0))].slice(
    0,
    MAX_APPS,
  )
  const apps = await Promise.all(unique.map(id => cachedApp(id).catch(() => null)))

  return apps.filter((app): app is SteamAppSummary => app !== null)
}
