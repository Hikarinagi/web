import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

const VISIBLE = 7

export function nearbyBrandWorks(
  works: NonNullable<GalgamePageData['brand_works']>,
  current: number,
) {
  const items = [...works.list.items].sort((a, b) =>
    (b.galgame.release_date ?? '').localeCompare(a.galgame.release_date ?? ''),
  )
  const at = Math.max(
    items.findIndex(item => item.galgame.id === current),
    0,
  )
  const start = Math.min(Math.max(at - 3, 0), Math.max(items.length - VISIBLE, 0))
  return items.slice(start, start + VISIBLE).map(item => item.galgame)
}
