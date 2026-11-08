import type { ApiData } from '@hikarinagi/api-contract/v3'

export type BackendDuplicateLookup = ApiData<'/api/v3/contribution/lookups/{resource_type}', 'get'>
export type BackendDuplicateCandidate = BackendDuplicateLookup['site'][number]
export type BackendDuplicateReason = BackendDuplicateCandidate['reasons'][number]
export type BackendExternalMatch = BackendDuplicateLookup['external'][number]

export const AUTHOR_SEARCH_TYPES = ['galgame', 'light-novel', 'manga']

export const TITLE_FIELDS: Record<string, { original: string; chinese?: string }> = {
  galgame: { original: 'origin_title', chinese: 'trans_title' },
  'light-novel': { original: 'name', chinese: 'name_cn' },
  'light-novel-volume': { original: 'name', chinese: 'name_cn' },
  manga: { original: 'name', chinese: 'name_cn' },
  'manga-volume': { original: 'name', chinese: 'name_cn' },
  person: { original: 'name', chinese: 'trans_name' },
  character: { original: 'name', chinese: 'trans_name' },
  producer: { original: 'name' },
  tag: { original: 'name' },
}

const ENTITY_TYPES = new Set(['PERSON', 'PRODUCER', 'TAG', 'CHARACTER'])

export function isEntityType(resourceType: string): boolean {
  return ENTITY_TYPES.has(resourceType)
}

export function levelText(level: BackendDuplicateCandidate['level'], resourceType: string) {
  if (level === 'on_site') return '已收录'
  if (level === 'author_work') return '同一作者'
  if (level === 'similar') return '相似'
  if (resourceType === 'PERSON') return '很可能是同一人物'
  if (resourceType === 'CHARACTER') return '很可能是同一角色'
  if (resourceType === 'PRODUCER') return '很可能是同一厂商'
  if (resourceType === 'TAG') return '很可能是同一标签'
  if (resourceType === 'LIGHT_NOVEL_VOLUME' || resourceType === 'MANGA_VOLUME') {
    return '很可能是同一条目'
  }
  return '很可能是同一作品'
}

export function notSameText(resourceType: string) {
  if (resourceType === 'PERSON') return '不是同一人物'
  if (resourceType === 'CHARACTER') return '不是同一角色'
  if (resourceType === 'PRODUCER') return '不是同一厂商'
  if (resourceType === 'TAG') return '不是同一标签'
  if (resourceType === 'LIGHT_NOVEL_VOLUME' || resourceType === 'MANGA_VOLUME') {
    return '不是同一条目'
  }
  return '不是同一作品'
}

export function reasonText(
  reason: BackendDuplicateReason,
  resourceType: string,
  query?: string,
): string {
  switch (reason.kind) {
    case 'external_id':
      if (reason.field === 'id') return `本站编号 #${reason.value}`
      if (reason.field === 'bangumi_id' && reason.label === 'Bangumi') {
        return `已关联至 Bangumi ${reason.value}`
      }
      if (reason.field === 'vndb_id' && reason.label === 'VNDB') {
        return `已关联至 VNDB ${reason.value}`
      }
      return `${reason.label ?? ''}相同`
    case 'name':
      if (
        reason.form_differs &&
        query &&
        query.replace(/\s/g, '') === (reason.name ?? '').replace(/\s/g, '')
      ) {
        return '名称相同（忽略空格）'
      }
      if (reason.form_differs) return '字形不同'
      return isEntityType(resourceType) ? '同名' : '标题相同'
    case 'bangumi_merged':
      return `Bangumi 将 ${reason.from_id} 并入 ${reason.to_id}`
    case 'same_work':
      return `同属《${reason.name ?? ''}》`
    case 'chapter_key':
      return `两者均为第 ${reason.number ?? ''} 话`
    case 'similar_name':
      return `相似标题「${reason.name ?? ''}」`
    case 'bangumi_name':
      return reason.alias
        ? `Bangumi 别名「${reason.name ?? ''}」`
        : `Bangumi 中文名「${reason.name ?? ''}」`
    case 'author':
      return '同一作者'
    case 'cover':
      return '封面相似'
    case 'isbn':
      return 'ISBN 相同'
    case 'volume_number':
      return '卷号相同'
  }
}

export function isBlocking(candidate: Pick<BackendDuplicateCandidate, 'level'>): boolean {
  return candidate.level === 'on_site' || candidate.level === 'likely'
}

export function hasKana(text: string): boolean {
  return /[぀-ヿ]/.test(text)
}

export const PUBLIC_PATH: Record<string, string> = {
  GALGAME: '/galgames/',
  LIGHT_NOVEL: '/light-novels/',
  LIGHT_NOVEL_VOLUME: '/light-novel-volumes/',
  MANGA: '/mangas/',
  MANGA_VOLUME: '/manga-volumes/',
  PERSON: '/people/',
  PRODUCER: '/producers/',
  CHARACTER: '/characters/',
}

const BANGUMI_FIELDS = ['bangumi_book_id', 'bangumi_game_id', 'bangumi_subject_id', 'bangumi_id']

export function submittedFacts(
  slug: string,
  payload: Record<string, unknown>[],
  resource: { title: string; cover: string | null } | null,
) {
  const scalar = (field?: string) =>
    field ? payload.find(op => op.kind === 'scalar' && op.field === field) : undefined
  const text = (field?: string) => {
    const value = scalar(field)?.to
    return typeof value === 'string' && value.trim() ? value.trim() : null
  }
  const titles = TITLE_FIELDS[slug]
  const author =
    scalar('author_id')?.to_name ??
    payload.find(
      op => op.kind === 'relation_add' && (op.relation === 'producers' || op.relation === 'staff'),
    )?.target_name
  const bangumi = BANGUMI_FIELDS.map(field => scalar(field)?.to).find(value => value != null)
  const vndb = scalar('vndb_id')?.to
  return {
    cover: resource?.cover ?? null,
    title: text(titles?.original) ?? resource?.title ?? '',
    subtitle: text(titles?.chinese),
    author: typeof author === 'string' ? author : null,
    label:
      typeof scalar('bunko_id')?.to_name === 'string' ? String(scalar('bunko_id')?.to_name) : null,
    year: (text('publication_date') ?? text('release_date'))?.slice(0, 4) ?? null,
    bangumi_id: bangumi == null ? null : String(bangumi),
    vndb_id:
      vndb == null || vndb === '' ? null : typeof vndb === 'number' ? `v${vndb}` : String(vndb),
    volumes: null as number | null,
    works: null as string[] | null,
  }
}
