import type { ApiData } from '@hikarinagi/api-contract/v3'

export type PointRecord = ApiData<'/api/v3/user/me/hikari-points/records', 'get'>['items'][number]

export const POINT_REASON_LABELS: Record<PointRecord['reason'], string> = {
  CHECK_IN_ADD: '签到',
  CHECK_IN_MILESTONE_ADD: '连签里程碑',
  CHECK_IN_MAKE_UP_SUBTRACT: '补签',
  DECORATION_PURCHASE_SUBTRACT: '兑换装扮',
  SYSTEM_ADD: '系统发放',
  SYSTEM_SUBTRACT: '系统扣除',
  RATE_ADD: '评分',
  REVIEW_ADD: '长评',
  CONTRIBUTION_ADD: 'wiki 贡献',
  READING_ADD: '读完一卷',
  POST_ADD: '发帖',
  ARTICLE_ADD: '发文章',
  COMMENT_ADD: '评论',
  FIRST_TIME_ADD: '首次奖励',
}

export function reasonLabel(reason: string): string {
  return POINT_REASON_LABELS[reason as PointRecord['reason']] ?? reason
}
