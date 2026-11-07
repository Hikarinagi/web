import type { EntryRating } from '~/components/entry/RatingCard.vue'
import type { GalgameRateStats } from '~/features/galgame/rate'

interface RatingStats {
  average: number | null
  rated_count: number
  distribution: { score: number; count: number }[]
  status_counts: {
    plan: number
    going: number
    completed: number
    on_hold: number
    dropped: number
  }
}

export function entryRating(
  stats: RatingStats,
  [plan, going, completed]: [string, string, string],
): EntryRating {
  return {
    average: stats.average,
    rated: stats.rated_count,
    distribution: stats.distribution,
    dimensions: [],
    statuses: [
      { label: plan, count: stats.status_counts.plan },
      { label: going, count: stats.status_counts.going },
      { label: completed, count: stats.status_counts.completed },
      { label: '搁置', count: stats.status_counts.on_hold },
      { label: '弃坑', count: stats.status_counts.dropped },
    ],
  }
}

export function gameRating(stats: GalgameRateStats): EntryRating {
  const scores = stats.dimension_averages
  return {
    ...entryRating(stats, ['想玩', '在玩', '玩过']),
    dimensions: [
      { label: '剧情', value: scores.scenario },
      { label: '角色', value: scores.character },
      { label: '画面', value: scores.visual },
      { label: '音乐', value: scores.music },
      { label: '演出', value: scores.direction },
      { label: '系统', value: scores.system },
    ],
  }
}
