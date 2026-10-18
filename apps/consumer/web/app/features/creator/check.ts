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
  const volume = resourceType === 'LIGHT_NOVEL_VOLUME'
  switch (field) {
    case 'name':
      return volume ? '名称' : '原名'
    case 'name_cn':
      return '中文名'
    case 'bunko_id':
      return '文库'
    case 'publication_date':
      return volume ? '出版日期' : '首次出版'
    case 'bangumi_book_id':
      return 'Bangumi 编号'
    case 'isbn':
      return 'ISBN'
  }
}

export function entityKind(entity: BackendCheckEntity): string {
  if (entity.resource_type === 'PERSON') return '人物'
  return entity.fields.includes('bunko_id') ? '文库' : '厂商'
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

export function checkTags(check: BackendChangeRequestCheck | null | undefined): CheckTag[] {
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
    tags.push({ text: `与待审 #${identity.id} 为同一本书`, tone: 'warning' })
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
