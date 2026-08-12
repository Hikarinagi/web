import type { ApiData } from '@hikarinagi/api-contract/v3'
import { getQuery, type H3Event } from 'h3'
import { bannerForPosition, type PromoBanner } from '~/features/promotion/placement'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

const BANNER_EVERY = 2 // 每 2 批插一个运营 banner(一批最多 4 个模块,故约每 4~8 个模块一条)

async function handler(event: H3Event) {
  const cursor = Math.max(0, Math.floor(Number(getQuery(event).cursor) || 0))
  const wantBanner = cursor > 0 && cursor % BANNER_EVERY === 0
  const [batch, banners]: [ApiData<'/api/v3/galgames/recommendations', 'get'>, PromoBanner[]] =
    await Promise.all([
      fetchBackendData(event, '/api/v3/galgames/recommendations', { query: { cursor } }),
      wantBanner
        ? fetchBackendData(event, '/api/v3/promotions/banners', {
            query: { surface: 'GALGAME_FEED' },
          }).catch(() => [] as PromoBanner[])
        : Promise.resolve([] as PromoBanner[]),
    ])

  const modules = batch.modules.flatMap(module => {
    const entry = moduleOf(module)
    return entry ? [entry] : []
  })
  const banner = bannerForPosition(cursor, banners, BANNER_EVERY)

  return {
    modules: banner
      ? [{ kind: 'banner' as const, key: `banner-${cursor}`, banner }, ...modules]
      : modules,
    next_cursor: batch.next_cursor,
  }
}

function moduleOf(module: ApiData<'/api/v3/galgames/recommendations', 'get'>['modules'][number]) {
  if (module.kind === 'GRID') {
    return { kind: 'grid' as const, key: module.key, items: module.items }
  }
  if (module.kind === 'FEATURE') {
    const item = module.items[0]
    if (!item) return null
    return {
      kind: 'feature' as const,
      key: module.key,
      item,
      intro: module.intro,
    }
  }
  if (module.reason === 'TAG') {
    if (!module.tag || !module.items.length) return null
    return {
      kind: 'rail' as const,
      key: module.key,
      title: `#${module.tag.name}`,
      to: `/galgames/browse?tag_groups=include.and.${module.tag.id}`,
      items: module.items,
    }
  }
  const title =
    module.reason === 'PLAYING'
      ? '大家最近在玩'
      : module.reason === 'COMPLETED'
        ? '最近通关并给出高分'
        : module.reason === 'SCENARIO'
          ? '剧本高分'
          : module.reason === 'VISUAL'
            ? '画面高分'
            : module.reason === 'MUSIC'
              ? '音乐高分'
              : null
  if (!title || !module.items.length) return null
  return {
    kind: 'rail' as const,
    key: module.key,
    title,
    to: undefined,
    items: module.items,
  }
}

export type GalgameStreamData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
