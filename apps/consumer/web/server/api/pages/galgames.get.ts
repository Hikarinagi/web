import type { H3Event } from 'h3'
import { GALGAME_EXPLORE_MOSAIC_SIZE, type GalgameHeroCover } from '~/features/galgame/explore'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

const LAST_MONTH_SIZE = 24

async function handler(event: H3Event) {
  const now = new Date()
  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const previousYear = previousMonth.getUTCFullYear()
  const previousMonthNumber = previousMonth.getUTCMonth() + 1
  const previousMonthKey = `${previousYear}-${String(previousMonthNumber).padStart(2, '0')}`

  const [catalog, heroCovers, release, lastMonth] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames', {
      query: {
        page: 1,
        page_size: 1,
        sort_field: 'start_date',
        sort_order: 'desc',
      },
    }),
    fetchBackendData(event, '/api/v3/galgames/covers/hero'),
    fetchBackendData(event, '/api/v3/galgames/releases/month'),
    fetchBackendData(event, '/api/v3/galgames', {
      query: {
        page: 1,
        page_size: LAST_MONTH_SIZE,
        sort_field: 'start_date',
        sort_order: 'desc',
        start_from: previousMonthKey,
        start_to: previousMonthKey,
        origin_lang: ['ja', 'zh-Hans', 'zh-Hant'],
        include_dev: true,
      },
    }),
  ])

  const mosaicItems = shuffle(heroCovers).slice(0, GALGAME_EXPLORE_MOSAIC_SIZE).map(mosaicOf)

  return {
    total_items: catalog.meta.total_items,
    mosaic: mosaicItems,
    release,
    last_month: {
      year: previousYear,
      month: previousMonthNumber,
      current_month: false,
      total_items: lastMonth.meta.total_items,
      browse_to: `/galgames/browse?sfrom=${previousMonthKey}&sto=${previousMonthKey}&dev=1`,
      items: lastMonth.items,
    },
  }
}

export type GalgamesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)

function mosaicOf(item: GalgameHeroCover) {
  return {
    id: item.id,
    source: item.cover,
    alt: item.title,
    width: item.cover.width,
    height: item.cover.height,
  }
}

function shuffle<T>(items: T[]) {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    const current = result[index]
    result[index] = result[target] as T
    result[target] = current as T
  }

  return result
}
