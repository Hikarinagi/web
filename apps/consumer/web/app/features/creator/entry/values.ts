import { CURRENCY_SYMBOL, RELATION_LABELS, langLabel } from '~/features/galgame/labels'
import { platformLabel } from '~/features/galgame/platforms'
import {
  ageRatingLabel,
  channelLabel,
  creditRoleLabel,
  releaseStatusLabel,
  SONG_KIND_LABELS,
  versionKindLabel,
} from '~/features/entry/labels'
import type {
  BackendEntryProperty,
  BackendPropertyDefinition,
  BackendStatement,
  BackendStatementCitation,
} from './contract'
import { CODE_LABELS, identifierLabel } from './codes'

export function dateText(date: string, precision: string | null): string {
  const [year, month, day] = date.split('-').map(Number)
  if (precision === 'YEAR') return `${year} 年`
  if (precision === 'MONTH') return `${year} 年 ${month} 月`
  return `${year} 年 ${month} 月 ${day} 日`
}

export function statementText(
  statement: Partial<BackendStatement> & Pick<BackendStatement, 'property'>,
): string {
  if (statement.value_kind === 'UNKNOWN') return '存在，但值未知'
  if (statement.value_kind === 'NONE') return '已确认没有值'
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
  if (statement.target)
    return statement.code
      ? `${statement.target.label}（${codeLabel(statement.property, statement.code)}）`
      : statement.target.label
  const code = statement.code
  if (code) {
    if (statement.property === 'CHANNEL_CODE')
      return `${codeLabel(statement.property, code)} ${statement.text ?? ''}`
    if (!statement.text) return codeLabel(statement.property, code)
  }
  return (
    statement.text?.replace(/\r\n?/g, '\n') ??
    (statement.number == null ? '' : String(statement.number))
  )
}

export function codeLabel(property: BackendEntryProperty, code: string): string {
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

export function linkOf(statement: BackendStatement): string | null {
  const text = statement.text
  if (!text) return null
  if (statement.property === 'WEBSITE') return text
  if (statement.property !== 'EXTERNAL_LINK') return null
  const urls: Record<string, string> = {
    VNDB: `https://vndb.org/${text}`,
    BANGUMI: `https://bgm.tv/subject/${text}`,
    EROGAMESCAPE: `https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/game.php?game=${text}`,
    MYANIMELIST: `https://myanimelist.net/manga/${text}`,
    ANILIST: `https://anilist.co/manga/${text}`,
    WIKIDATA: `https://www.wikidata.org/wiki/${text}`,
  }
  return urls[statement.code ?? ''] ?? (/^https?:\/\//i.test(text) ? text : null)
}

export function sourcesOf(statement: BackendStatement): BackendStatementCitation[] {
  return statement.citations.filter(
    citation =>
      citation.role === 'SUPPORT' && citation.method !== 'IMPORT' && citation.method !== 'MEMBER',
  )
}

export function accessedText(value: string | null, full = false): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const now = new Date()
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const day = `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  if (full) return `${date.getFullYear()} 年 ${day} ${time}`
  if (date.toDateString() === now.toDateString()) return time
  return date.getFullYear() === now.getFullYear() ? day : `${date.getFullYear()} 年 ${day}`
}

export function isLong(definition: BackendPropertyDefinition | undefined): boolean {
  return [
    'ORIGINAL_INTRO',
    'CHINESE_INTRO',
    'ENGLISH_INTRO',
    'INTRO',
    'BONUS',
    'SPECIFICATION',
    'OFFICIAL_INTRO',
  ].includes(definition?.property ?? '')
}

export function isEditable(definition: BackendPropertyDefinition): boolean {
  return definition.shape !== 'rich'
}

export function qualifierText(statement: BackendStatement): string | null {
  const from = statement.period_from
    ? dateText(statement.period_from, statement.period_from_precision)
    : null
  const to = statement.period_to
    ? dateText(statement.period_to, statement.period_to_precision)
    : null
  const period = from && to ? `${from} 至 ${to}` : from ? `${from} 起` : to ? `至 ${to}` : null
  const parts = [statement.part ? `适用于${statement.part}` : null, period].filter(Boolean)
  return parts.length ? parts.join('，') : null
}

export function isUnpublished(statement: BackendStatement): boolean {
  const support = statement.citations.filter(citation => citation.role === 'SUPPORT')
  return (
    support.length > 0 &&
    support.every(citation => citation.method === 'SCREENSHOT' && citation.version !== null)
  )
}
