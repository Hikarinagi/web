import { defineBreadcrumb } from '@unhead/schema-org/vue'

interface RateStats {
  average: number | null
  rated_count: number
}

export function ratingNode(stats: RateStats | null | undefined) {
  if (!stats || stats.average == null || stats.rated_count <= 0) return undefined
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(stats.average.toFixed(2)),
    ratingCount: stats.rated_count,
    bestRating: 10,
    worstRating: 1,
  }
}

export function breadcrumbNode(items: { name: string; item: string }[]) {
  return defineBreadcrumb({ itemListElement: items })
}

export function relationCount(rel: { meta: { total_items: number } } | null | undefined) {
  return rel?.meta.total_items ?? 0
}
