import type { ApiData } from '@hikarinagi/api-contract/v3'
import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const cursor = Math.max(0, Math.floor(Number(getQuery(event).cursor) || 0))
  const batch: ApiData<'/api/v3/galgames/recommendations', 'get'> = await fetchBackendData(
    event,
    '/api/v3/galgames/recommendations',
    { query: { cursor } },
  )

  return {
    modules: batch.modules.flatMap(module => {
      const entry = moduleOf(module)
      return entry ? [entry] : []
    }),
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
            ? '画面评分'
            : module.reason === 'MUSIC'
              ? '音乐评分'
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
