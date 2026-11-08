import { PRODUCER_TYPE_CN } from '@hikarinagi/shared'
import type {
  CharacterDetail,
  EntityDetail,
  EntityKind,
  EntityMedia,
  PersonDetail,
  ProducerDetail,
} from './entity'
import { labelValue } from './labels'

const TYPE_LABELS: Record<EntityKind, string> = {
  person: '人物',
  character: '角色',
  producer: '厂商',
}

const PRODUCER_TYPE_LABELS: Record<string, string> = { ...PRODUCER_TYPE_CN, INDIVIDUAL: '' }

const PERSON_META_KEYS = ['生日', '出生地', '事务所']

export function entityTypeLabel(kind: EntityKind): string {
  return TYPE_LABELS[kind]
}

export function heroTypeLabel(kind: EntityKind, entity: EntityDetail): string {
  if (kind !== 'producer') return TYPE_LABELS[kind]
  return PRODUCER_TYPE_LABELS[(entity as ProducerDetail).type] ?? '厂商'
}

export function entityTitle(kind: EntityKind, entity: EntityDetail): string {
  if (kind === 'producer') return entity.name
  return (entity as PersonDetail).trans_name || entity.name
}

export function entitySubName(kind: EntityKind, entity: EntityDetail): string | null {
  if (kind === 'producer') return null
  const title = entityTitle(kind, entity)
  return entity.name && entity.name !== title ? entity.name : null
}

export function entityImage(kind: EntityKind, entity: EntityDetail): EntityMedia | null {
  if (kind === 'producer') return (entity as ProducerDetail).logo
  return (entity as PersonDetail).image
}

export function entityGender(entity: EntityDetail): string | null {
  return 'gender' in entity ? (entity.gender ?? null) : null
}

export function entityHeroMeta(kind: EntityKind, entity: EntityDetail): string | null {
  if (kind === 'producer') {
    const producer = entity as ProducerDetail
    const parts = [
      producer.country,
      producer.established ? `成立于 ${producer.established}` : null,
    ].filter((part): part is string => Boolean(part))
    return parts.length ? parts.join('    ·    ') : null
  }

  if (kind === 'character') {
    const c = entity as CharacterDetail
    const birthday =
      c.birthday_month != null
        ? c.birthday_day != null
          ? `${c.birthday_month}月${c.birthday_day}日`
          : `${c.birthday_month}月`
        : null
    const parts = [
      birthday,
      c.blood_type ? `${c.blood_type}型` : null,
      c.height != null ? `${c.height}cm` : null,
    ].filter((part): part is string => Boolean(part))
    return parts.length ? parts.join('    ·    ') : null
  }

  const parts = PERSON_META_KEYS.map(key => labelValue(entity.labels, key)).filter(
    (part): part is string => Boolean(part),
  )
  return parts.length ? parts.join('    ·    ') : null
}

export function cleanAliases(
  aliases: string[] | null | undefined,
  max = 6,
): { shown: string[]; overflow: number } {
  const cleaned = (aliases ?? []).filter(alias => alias && alias.length <= 24)
  return { shown: cleaned.slice(0, max), overflow: Math.max(0, cleaned.length - max) }
}
