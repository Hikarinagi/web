import type * as v from 'valibot'
import type { MessageKey } from '~~/i18n/keys'

export function translate(key: MessageKey, params: Record<string, unknown> = {}): string {
  return useNuxtApp().$i18n.t(key, params)
}

export function tryTranslate(key: string, params: Record<string, unknown> = {}): string | null {
  const i18n = useNuxtApp().$i18n
  return i18n.te(key) ? i18n.t(key, params) : null
}

export function issueMessage(key: MessageKey, params: Record<string, unknown> = {}) {
  return (issue: v.BaseIssue<unknown>) =>
    translate(key, { requirement: issue.requirement, ...params })
}

export function currentLocale(): string {
  return useNuxtApp().$i18n.locale.value
}

export function formatList(items: string[]): string {
  return new Intl.ListFormat(currentLocale(), {
    type: 'conjunction',
    style: 'narrow',
  }).format(items)
}
