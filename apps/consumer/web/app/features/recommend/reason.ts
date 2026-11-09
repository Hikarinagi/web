import type { components } from '@hikarinagi/api-contract/v3'

const ROLE_LABEL: Record<string, string> = {
  DIRECTOR: '导演',
  SCENARIO: '剧本',
  CHARACTER_DESIGN: '人物设定',
  ORIGINAL_ART: '原画',
  MUSIC: '音乐',
}

export function recommendSub(item: {
  maker: string | null
  reason: components['schemas']['RecommendReasonDto'] | null
}) {
  const { reason } = item
  if (reason?.kind === 'TAG') return `同样是${reason.name}`
  if (reason?.role && ROLE_LABEL[reason.role])
    return `同一${ROLE_LABEL[reason.role]}：${reason.name}`
  return item.maker ?? '看过的人也在看'
}
