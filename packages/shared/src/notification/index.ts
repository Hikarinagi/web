import { TYPE, parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import { IntlMessageFormat } from 'intl-messageformat'
import type { MessageKeyOf, MessagesOf, SharedLocale } from '../locales'
import { date } from '../locales/zh-CN/date'
import { notification } from '../locales/zh-CN/notification'
import { review } from '../locales/zh-CN/review'

export const NOTIFICATION_MESSAGES = { 'zh-CN': notification } satisfies Record<
  SharedLocale,
  MessagesOf<typeof notification>
>

export const REVIEW_MESSAGES = { 'zh-CN': review } satisfies Record<
  SharedLocale,
  MessagesOf<typeof review>
>

const DATE_PATTERNS = { 'zh-CN': date } satisfies Record<SharedLocale, MessagesOf<typeof date>>

export const DEFAULT_TIME_ZONE = 'Asia/Shanghai'

export type NotificationKey = MessageKeyOf<typeof notification>

export type ReviewKey = `review.${MessageKeyOf<typeof review>}`

export type TextKey = NotificationKey | ReviewKey

export type MessageText<K extends TextKey = TextKey> = {
  key: K
  params: Record<string, string | number | MessageText>
}

const NESTING_LIMIT = 4

const compiled = new Map<string, { format: IntlMessageFormat; dates: Map<string, string | null> }>()

function dateElements(
  elements: MessageFormatElement[],
  patterns: Record<string, string>,
  dates: Map<string, string | null>,
): MessageFormatElement[] {
  return elements.map(element => {
    if (element.type === TYPE.date || element.type === TYPE.time) {
      const pattern = typeof element.style === 'string' ? (patterns[element.style] ?? null) : null
      dates.set(element.value, pattern)
      if (!pattern) return element
      return { type: TYPE.argument, value: element.value, location: element.location }
    }
    if (element.type === TYPE.select || element.type === TYPE.plural) {
      return {
        ...element,
        options: Object.fromEntries(
          Object.entries(element.options).map(([name, option]) => [
            name,
            { ...option, value: dateElements(option.value, patterns, dates) },
          ]),
        ),
      }
    }
    if (element.type === TYPE.tag) {
      return { ...element, children: dateElements(element.children, patterns, dates) }
    }
    return element
  })
}

export function formatMessage(
  template: string,
  params: Record<string, string | number>,
  locale: SharedLocale,
): string {
  const id = `${locale}\u0000${template}`
  let entry = compiled.get(id)
  if (!entry) {
    const dates = new Map<string, string | null>()
    const ast = dateElements(parse(template, { ignoreTag: true }), DATE_PATTERNS[locale], dates)
    const format = new IntlMessageFormat(ast, locale, undefined, {
      ignoreTag: true,
      formatters: {
        getNumberFormat: (...args) => new Intl.NumberFormat(...args),
        getDateTimeFormat: (locales, options) =>
          new Intl.DateTimeFormat(locales, { ...options, timeZone: DEFAULT_TIME_ZONE }),
        getPluralRules: (...args) => new Intl.PluralRules(...args),
      },
    })
    entry = { format, dates }
    compiled.set(id, entry)
  }
  const values: Record<string, string | number | Date> = { ...params }
  for (const [name, pattern] of entry.dates) {
    const value = params[name]
    if (typeof value !== 'string') continue
    const at = new Date(value)
    if (!pattern) {
      values[name] = at
      continue
    }
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat(locale, {
        timeZone: DEFAULT_TIME_ZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
        .formatToParts(at)
        .map(part => [part.type, part.value]),
    )
    values[name] = pattern.replace(/\{(year|month|day|hour|minute)\}/g, (_, part: string) =>
      String(parts[part]),
    )
  }
  return String(entry.format.format(values))
}

export function renderText(text: MessageText, locale: SharedLocale, depth = 0): string | null {
  if (depth > NESTING_LIMIT || typeof text !== 'object' || text === null) return null
  const { key, params } = text as { key?: unknown; params?: unknown }
  if (typeof key !== 'string' || typeof params !== 'object' || params === null) return null
  let node: unknown = key.startsWith('review.')
    ? { review: REVIEW_MESSAGES[locale] }
    : NOTIFICATION_MESSAGES[locale]
  for (const segment of key.split('.')) {
    node =
      typeof node === 'object' && node !== null
        ? (node as Record<string, unknown>)[segment]
        : undefined
  }
  if (typeof node !== 'string') return null
  const values: Record<string, string | number> = {}
  for (const [name, value] of Object.entries(params)) {
    if (typeof value === 'string' || typeof value === 'number') {
      values[name] = value
      continue
    }
    const nested = renderText(value as MessageText, locale, depth + 1)
    if (nested === null) return null
    values[name] = nested
  }
  try {
    return formatMessage(node, values, locale)
  } catch {
    return null
  }
}
