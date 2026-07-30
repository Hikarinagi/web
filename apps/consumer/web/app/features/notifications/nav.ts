// 推导通知「前往」目标:变更请求通知优先跳 CR 详情页;否则取首个 work card 的路由 + comment card 的 #comment 锚点。

const WORK_ROUTE: Record<string, string> = {
  galgame_card: '/galgames',
  light_novel_card: '/light-novels',
  light_novel_volume_card: '/light-novel-volumes',
  person_card: '/people',
  producer_card: '/producers',
  character_card: '/characters',
  article_card: '/articles',
  post_card: '/posts',
}

const WORK_ID_KEY: Record<string, string> = {
  galgame_card: 'galgame_id',
  light_novel_card: 'light_novel_id',
  light_novel_volume_card: 'light_novel_volume_id',
  person_card: 'person_id',
  producer_card: 'producer_id',
  character_card: 'character_id',
  article_card: 'article_id',
  post_card: 'post_id',
}

interface DocNode {
  type: string
  attrs?: Record<string, unknown>
}

export function notificationTarget(
  detail:
    | { change_request_id?: number | null; content_json?: { content?: DocNode[] } | null }
    | null
    | undefined,
): string | null {
  if (!detail) return null
  if (detail.change_request_id != null) {
    return `/create/contributions/${detail.change_request_id}`
  }
  const content = detail.content_json?.content
  if (!Array.isArray(content)) return null
  const work = content.find(n => WORK_ROUTE[n.type])
  if (!work) return null
  const id = work.attrs?.[WORK_ID_KEY[work.type]!]
  if (typeof id !== 'number') return null
  const commentId = content.find(n => n.type === 'comment_card')?.attrs?.comment_id
  const anchor = typeof commentId === 'number' ? `?comment=${commentId}#comment-${commentId}` : ''
  return `${WORK_ROUTE[work.type]}/${id}${anchor}`
}
