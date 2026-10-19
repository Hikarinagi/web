import type { BackendChangeRequestSummary } from './contribution'

export type BackendChangeRequestCheck = NonNullable<BackendChangeRequestSummary['check']>
export type BackendCheckVerification = NonNullable<BackendChangeRequestCheck['verification']>
export type BackendCheckField = BackendCheckVerification['fields'][number]
export type BackendCheckEntity = BackendCheckVerification['entities'][number]
export type BackendCheckEvidence = BackendCheckVerification['evidence'][number]
export type BackendCheckSource = BackendCheckVerification['sources'][number]

export interface CheckTag {
  text: string
  tone: 'warning' | 'neutral' | 'success' | 'danger'
}

export function checkFieldLabel(field: BackendCheckField['field'], resourceType: string): string {
  const volume = resourceType === 'LIGHT_NOVEL_VOLUME' || resourceType === 'MANGA_VOLUME'
  const work = resourceType === 'LIGHT_NOVEL' || resourceType === 'MANGA'
  switch (field) {
    case 'name':
    case 'origin_title':
      return work || resourceType === 'GALGAME' ? '原名' : '名称'
    case 'name_cn':
    case 'trans_title':
    case 'trans_name':
      return '中文名'
    case 'bunko_id':
      return '文库'
    case 'producers':
      return '品牌'
    case 'publication_date':
      return volume ? '出版日期' : '首次出版'
    case 'release_date':
      return '发售日期'
    case 'volume_number':
      return '卷号'
    case 'bangumi_book_id':
    case 'bangumi_game_id':
    case 'bangumi_subject_id':
    case 'bangumi_id':
      return 'Bangumi 编号'
    case 'vndb_id':
      return 'VNDB 编号'
    case 'isbn':
      return 'ISBN'
  }
  return field
}

export function entityKind(entity: Pick<BackendCheckEntity, 'resource_type' | 'fields'>): string {
  if (entity.resource_type === 'PERSON') return '人物'
  if (entity.resource_type === 'CHARACTER') return '角色'
  if (entity.resource_type === 'TAG') return '标签'
  if (entity.fields.includes('bunko_id')) return '文库'
  return entity.fields.includes('producers') ? '品牌' : '厂商'
}

export function sameEntryText(resourceType: string): string {
  if (resourceType === 'GALGAME' || resourceType === 'MANGA') return '同一部作品'
  if (resourceType === 'PERSON') return '同一人物'
  if (resourceType === 'PRODUCER') return '同一厂商'
  if (resourceType === 'CHARACTER') return '同一角色'
  if (resourceType === 'TAG') return '同一标签'
  return '同一本书'
}

export function isRunning(check: BackendChangeRequestCheck | null | undefined): boolean {
  return check?.status === 'QUEUED' || check?.status === 'RUNNING'
}

export function isFailed(check: BackendChangeRequestCheck | null | undefined): boolean {
  return check?.status === 'FAILED' || check?.status === 'TIMED_OUT'
}

export function onSite(check: BackendChangeRequestCheck | null | undefined) {
  const identity = check?.status === 'DONE' ? check.verification?.identity : null
  return identity?.verified && identity.kind === 'site' && identity.id != null ? identity : null
}

export function checkTags(
  check: BackendChangeRequestCheck | null | undefined,
  resourceType: string,
): CheckTag[] {
  if (!check) return []
  if (isRunning(check)) return [{ text: '核对中', tone: 'neutral' }]
  if (isFailed(check)) return [{ text: '未能核对', tone: 'danger' }]
  const verification = check.verification
  if (!verification) return []
  const tags: CheckTag[] = []
  const { identity } = verification
  if (identity.verified && identity.kind === 'site') {
    tags.push({ text: `已收录 #${identity.id}`, tone: 'warning' })
  } else if (identity.verified && identity.kind === 'pending') {
    tags.push({ text: `与待审 #${identity.id} 为${sameEntryText(resourceType)}`, tone: 'warning' })
  } else if (verification.mismatches > 0) {
    tags.push({ text: `与原版不符 ${verification.mismatches} 处`, tone: 'warning' })
  } else if (identity.kind === 'new') {
    tags.push({ text: '与原版一致', tone: 'success' })
  } else {
    tags.push({ text: '未能识别原版', tone: 'neutral' })
  }
  for (const entity of verification.entities) {
    if (!entity.verified || entity.existing_id == null) continue
    tags.push({ text: `${entityKind(entity)}：可改用 #${entity.existing_id}`, tone: 'neutral' })
  }
  return tags
}

export interface CheckOverride {
  field: BackendCheckField['field']
  value: string | number
}

export interface CheckEntityChoice {
  change_request_id: number
  use_id: number
}
