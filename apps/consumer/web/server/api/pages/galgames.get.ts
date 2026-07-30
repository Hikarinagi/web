import type { H3Event } from 'h3'
import { GALGAME_EXPLORE_MOSAIC_SIZE, type GalgameHeroCover } from '~/features/galgame/explore'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

async function handler(event: H3Event) {
  const [summary, heroCovers, release, reviews] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames', {
      query: {
        page: 1,
        page_size: 1,
        sort_field: 'views',
        sort_order: 'desc',
      },
    }),
    fetchBackendData(event, '/api/v3/galgames/covers/hero'),
    fetchBackendData(event, '/api/v3/galgames/releases/month'),
    fetchBackendData(event, '/api/v3/galgames/rates/cloud'),
  ])

  const mosaicItems = shuffle(heroCovers).slice(0, GALGAME_EXPLORE_MOSAIC_SIZE).map(mosaicOf)

  return {
    total_items: summary.meta.total_items,
    mosaic: mosaicItems,
    release,
    reviews,
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
