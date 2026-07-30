import type {
  CharacterDetail,
  EntityDetail,
  EntityKind,
  EntityLabel,
  PersonDetail,
  ProducerDetail,
} from './entity'
import { normalizeLabels, type EntityLabelView } from './labels'

export type EntityInfoRow = EntityLabelView

function row(key: string, value: string, href: string | null = null): EntityInfoRow {
  return { key, value, href }
}

function stripUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

function bangumiUrl(kind: EntityKind, id: string): string {
  return kind === 'character' ? `https://bgm.tv/character/${id}` : `https://bgm.tv/person/${id}`
}

function birthday(month: number | null, day: number | null): string | null {
  if (month == null) return null
  return day != null ? `${month}月${day}日` : `${month}月`
}

function bwh(bust: number | null, waist: number | null, hips: number | null): string | null {
  const parts = [
    bust != null ? `B${bust}` : null,
    waist != null ? `W${waist}` : null,
    hips != null ? `H${hips}` : null,
  ].filter((p): p is string => Boolean(p))
  return parts.length ? parts.join(' / ') : null
}

export function buildHeadRows(kind: EntityKind, entity: EntityDetail): EntityInfoRow[] {
  const rows: EntityInfoRow[] = []

  if (kind === 'character') {
    const c = entity as CharacterDetail
    if (c.gender) rows.push(row('性别', c.gender))
    const b = birthday(c.birthday_month, c.birthday_day)
    if (b) rows.push(row('生日', b))
    if (c.blood_type) rows.push(row('血型', `${c.blood_type}型`))
    if (c.height != null) rows.push(row('身高', `${c.height}cm`))
    if (c.weight != null) rows.push(row('体重', `${c.weight}kg`))
    const m = bwh(c.bust, c.waist, c.hips)
    if (m) rows.push(row('三围', m))
    if (c.cup) rows.push(row('罩杯', c.cup))
    if (c.age != null) rows.push(row('年龄', `${c.age}`))
  } else if (kind === 'person') {
    const p = entity as PersonDetail
    if (p.gender) rows.push(row('性别', p.gender))
  } else {
    const pr = entity as ProducerDetail
    if (pr.country) rows.push(row('国家', pr.country))
    if (pr.established) rows.push(row('成立', pr.established))
    if (pr.website) rows.push(row('官网', stripUrl(pr.website), pr.website))
  }

  return rows
}

function valueKey(value: string): string {
  return value.replace(/[^\p{L}\p{N}]+/gu, '').toLowerCase()
}

export function buildInfoRows(
  kind: EntityKind,
  entity: EntityDetail,
  labels: EntityLabel[] | null | undefined,
): EntityInfoRow[] {
  const head = buildHeadRows(kind, entity)
  const seenKeys = new Set(head.map(r => r.key))
  const seenValues = new Set(head.map(r => valueKey(r.value)))
  return [
    ...head,
    ...normalizeLabels(labels).filter(
      l => !seenKeys.has(l.key) && !seenValues.has(valueKey(l.value)),
    ),
  ]
}

export interface EntitySourceLink {
  label: string
  href: string
}

export function buildSourceLinks(kind: EntityKind, entity: EntityDetail): EntitySourceLink[] {
  const links: EntitySourceLink[] = []
  if (entity.vndb_id) links.push({ label: 'VNDB', href: `https://vndb.org/${entity.vndb_id}` })
  if (entity.bangumi_id) links.push({ label: 'Bangumi', href: bangumiUrl(kind, entity.bangumi_id) })
  return links
}
