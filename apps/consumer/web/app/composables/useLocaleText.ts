import type { DateFormatKey, MessageKey } from '~~/i18n/keys'

export function useLocaleText() {
  const { t, d, n, locale } = useI18n()
  return {
    t: (key: MessageKey, params: Record<string, unknown> = {}) => t(key, params),
    d: (
      value: Date | number,
      format?: DateFormatKey | (Intl.DateTimeFormatOptions & { key: DateFormatKey }),
    ) => (format ? d(value, format) : d(value)),
    n: (value: number, options?: Intl.NumberFormatOptions) =>
      options ? n(value, options) : n(value),
    locale,
  }
}
