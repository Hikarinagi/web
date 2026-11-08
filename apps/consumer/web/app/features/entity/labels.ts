import type { EntityLabel } from './entity'

const PLACEHOLDER_VALUES = new Set(['未知', '暂无', '暂無', '无', '-', ''])

export interface EntityLabelView {
  key: string
  value: string
  href: string | null
}

export function isPlaceholderValue(value: string | null | undefined): boolean {
  return PLACEHOLDER_VALUES.has((value ?? '').trim())
}

export function labelValue(labels: EntityLabel[] | null | undefined, key: string): string | null {
  const value = labels?.find(label => label.key === key)?.value?.trim()
  return value && !isPlaceholderValue(value) ? value : null
}

export function normalizeLabels(
  labels: EntityLabel[] | null | undefined,
  skipKeys: string[] = [],
): EntityLabelView[] {
  if (!labels?.length) return []
  const skip = new Set(skipKeys)
  return labels
    .filter(label => !skip.has(label.key) && !isPlaceholderValue(label.value))
    .map(label => {
      const isUrl = /^https?:\/\//i.test(label.value)
      return {
        key: label.key,
        value: isUrl ? label.value.replace(/^https?:\/\//i, '').replace(/\/+$/, '') : label.value,
        href: isUrl ? label.value : null,
      }
    })
}

export function workYear(date: string | null | undefined): number | null {
  if (!date) return null
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getFullYear()
}

const PERSON_LN_RELATION_LABELS: Record<string, string> = { author: '作者', illustrator: '插画' }
const PRODUCER_LN_RELATION_LABELS: Record<string, string> = { publisher: '出版', bunko: '文库' }

export function personLnRelationLabel(relation: string): string {
  return PERSON_LN_RELATION_LABELS[relation] ?? relation
}

export function producerLnRelationLabel(relation: string): string {
  return PRODUCER_LN_RELATION_LABELS[relation] ?? relation
}

export const PRODUCER_RELATION_LABELS: Record<string, string> = {
  PARENT: '母公司',
  SUBSIDIARY: '子公司',
  IMPRINT: '旗下厂牌',
  IMPRINT_PARENT: '母厂牌',
  SPAWNED: '衍生',
  ORIGINATED: '源自',
  OLD_NAME: '曾用名',
  NEW_NAME: '现用名',
}

export function producerRelationLabel(relation: string): string {
  return PRODUCER_RELATION_LABELS[relation] ?? relation
}
