import type { SystemMessageItem } from './notifications'

type Target = NonNullable<SystemMessageItem['target']>

const WORK_ROUTE: Partial<Record<Target['kind'], string>> = {
  galgame: '/galgames',
  light_novel: '/light-novels',
  light_novel_volume: '/light-novel-volumes',
  manga: '/mangas',
  person: '/people',
  producer: '/producers',
  character: '/characters',
  article: '/articles',
  post: '/posts',
}

const RATE_ROUTE: Partial<Record<Target['kind'], string>> = {
  galgame_rate: '/galgames',
  light_novel_rate: '/light-novels',
  manga_rate: '/mangas',
}

function anchor(commentId: number | null): string {
  return commentId == null ? '' : `?comment=${commentId}#comment-${commentId}`
}

const EDIT_ROUTE: Partial<Record<Target['kind'], string>> = {
  galgame: 'galgame',
  light_novel: 'light-novel',
  light_novel_volume: 'light-novel-volume',
  manga: 'manga',
  person: 'person',
  producer: 'producer',
  character: 'character',
}

export function notificationTarget(
  source: { target?: Target | null; template_key?: string | null } | null | undefined,
): string | null {
  const target = source?.target
  if (!target) return null

  const edit = EDIT_ROUTE[target.kind]
  if (source?.template_key === 'contribution.closed' && edit && target.id != null) {
    return `/create/edit/${edit}/${target.id}`
  }

  if (target.kind === 'decoration') return '/me/decoration'
  if (target.kind === 'dm') return target.id == null ? null : `/messages?peer=${target.id}`
  if (target.kind === 'novel_project') {
    return target.id == null ? null : `/create/projects/${target.id}`
  }
  if (target.kind === 'manga_project') {
    return target.id == null ? null : `/create/manga/${target.id}`
  }
  if (target.kind === 'change_request') {
    return '/create/edits'
  }

  const rate = RATE_ROUTE[target.kind]
  if (rate) {
    return target.id == null || target.work_id == null
      ? null
      : `${rate}/${target.work_id}/rates/${target.id}`
  }

  const work = WORK_ROUTE[target.kind]
  if (!work || target.id == null) return null
  return `${work}/${target.id}${anchor(target.comment_id)}`
}
