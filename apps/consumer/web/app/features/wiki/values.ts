import {
  ageRatingLabel,
  channelLabel,
  creditRoleLabel,
  releaseStatusLabel,
  SONG_KIND_LABELS,
  versionKindLabel,
} from '~/features/entry/labels'
import { CURRENCY_SYMBOL, RELATION_LABELS, langLabel } from '~/features/galgame/labels'
import { platformLabel } from '~/features/galgame/platforms'
import type { components } from '@hikarinagi/api-contract/v3'
import { CODE_LABELS, identifierLabel } from './codes'

export type WikiProperty = components['schemas']['PropertyDefinitionDto']['property']
export type ComparedStatement = components['schemas']['ComparedStatementDto']

export const DEPRECATION_REASONS: Record<string, string> = {
  CONTRADICTED: '内容有误',
  WRONG_ENTRY: '不属于此条目',
  DUPLICATE: '与另一个值重复',
  RESCHEDULED: '发售日已改期',
  BAD_SOURCE: '无从查证',
  REVERTED: '已撤销',
}

export const LONG_PROPERTIES: readonly WikiProperty[] = [
  'ORIGINAL_INTRO',
  'CHINESE_INTRO',
  'INTRO',
  'BONUS',
  'SPECIFICATION',
  'OFFICIAL_INTRO',
]

export function dateText(date: string, precision: string | null): string {
  const [year, month, day] = date.split('-').map(Number)
  if (precision === 'YEAR') return `${year} 年`
  if (precision === 'MONTH') return `${year} 年 ${month} 月`
  return `${year} 年 ${month} 月 ${day} 日`
}

export function codeLabel(property: WikiProperty, code: string): string {
  if (property === 'PLATFORM') return platformLabel(code)
  if (property === 'LANGUAGE') return langLabel(code)
  if (property === 'RELEASE_STATUS') return releaseStatusLabel(code) ?? code
  if (property === 'AGE_RATING') return ageRatingLabel(code) ?? code
  if (property === 'CHANNEL_CODE') return channelLabel(code)
  if (property === 'CREDIT') return creditRoleLabel(code)
  if (property === 'INCLUDED_GAME') return versionKindLabel(code) ?? code
  if (property === 'GAME_RELATION') return RELATION_LABELS[code] ?? code
  if (property === 'IDENTIFIER') return identifierLabel(code)
  return CODE_LABELS[property]?.[code] ?? code
}

export function relationLead(code: string | null, side: 'held' | 'given'): string {
  if (code === 'SAME_SERIES') return '它与本作'
  return side === 'given' ? '它是本作的' : '本作是它的'
}

export function relationPhrase(
  property: WikiProperty,
  code: string,
  side: 'other' | 'self',
): string {
  const label = codeLabel(property, code)
  if (code === 'SAME_SERIES') return side === 'other' ? '它与本作同系列' : '本作与它同系列'
  return side === 'other' ? `它是本作的${label}` : `本作是它的${label}`
}

export function valueText(
  statement: Partial<ComparedStatement> & Pick<ComparedStatement, 'property'>,
): string {
  if (statement.value_kind === 'UNKNOWN') return '存在，但值未知'
  if (statement.date) return dateText(statement.date, statement.date_precision ?? null)
  if (statement.amount && statement.currency) {
    const value = Number(statement.amount)
    const number = value.toLocaleString('en-US', {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    })
    const symbol = CURRENCY_SYMBOL[statement.currency]
    const tax =
      statement.tax_included === true
        ? '（含税）'
        : statement.tax_included === false
          ? '（不含税）'
          : ''
    return (symbol ? `${symbol}${number}` : `${number} ${statement.currency}`) + tax
  }
  if (statement.property === 'CREDIT') {
    const song = [statement.song, statement.song_kind && SONG_KIND_LABELS[statement.song_kind]]
      .filter(Boolean)
      .join('，')
    return `${statement.text ?? statement.target?.label ?? ''}（${codeLabel('CREDIT', statement.code ?? '')}${song ? `：${song}` : ''}）`
  }
  if (statement.property === 'GAME_RELATION' && statement.target && statement.code)
    return statement.code === 'SAME_SERIES'
      ? `与《${statement.target.label}》同系列`
      : `是《${statement.target.label}》的${codeLabel('GAME_RELATION', statement.code)}`
  if (statement.target)
    return statement.code
      ? `${statement.target.label}（${codeLabel(statement.property, statement.code)}）`
      : statement.target.label
  const code = statement.code
  if (code) {
    if (['CHANNEL_CODE', 'EXTERNAL_LINK', 'IDENTIFIER'].includes(statement.property))
      return `${codeLabel(statement.property, code)} ${statement.text ?? ''}`
    if (!statement.text) return codeLabel(statement.property, code)
  }
  const text = statement.text?.replace(/\r\n?/g, '\n')
  const reading = statement.reading && statement.reading !== text ? `（${statement.reading}）` : ''
  return text ? `${text}${reading}` : statement.number == null ? '' : String(statement.number)
}

export function sourceText(statement: Pick<ComparedStatement, 'citations'>): string {
  const names = statement.citations
    .filter(
      citation =>
        citation.role === 'SUPPORT' && citation.method !== 'IMPORT' && citation.method !== 'MEMBER',
    )
    .map(
      citation =>
        citation.source ?? citation.url ?? (citation.method === 'SCREENSHOT' ? '作品截图' : ''),
    )
  return [...new Set(names.filter(Boolean))].join('、')
}

export function qualifierText(
  statement: Pick<
    ComparedStatement,
    'period_from' | 'period_from_precision' | 'period_to' | 'period_to_precision' | 'part'
  > &
    Partial<Pick<ComparedStatement, 'language' | 'versions' | 'is_public'>>,
): string | null {
  const from = statement.period_from
    ? dateText(statement.period_from, statement.period_from_precision)
    : null
  const to = statement.period_to
    ? dateText(statement.period_to, statement.period_to_precision)
    : null
  const period = from && to ? `${from} 至 ${to}` : from ? `${from} 起` : to ? `至 ${to}` : null
  const parts = [
    statement.part ? `适用于${statement.part}` : null,
    statement.versions?.length
      ? `适用于${statement.versions.map(version => version.label).join('、')}`
      : null,
    statement.language ? langLabel(statement.language) : null,
    period,
    statement.is_public === false ? '未公开' : null,
  ].filter(Boolean)
  return parts.length ? parts.join('，') : null
}
