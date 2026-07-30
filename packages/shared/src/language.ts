export const ORIGIN_LANGUAGE_CODES = ['ja', 'zh-Hans', 'zh-Hant', 'en', 'ko', 'ru'] as const

export type OriginLanguageCode = (typeof ORIGIN_LANGUAGE_CODES)[number]

export function isOriginLanguage(value: string | null | undefined): value is OriginLanguageCode {
  return value != null && (ORIGIN_LANGUAGE_CODES as readonly string[]).includes(value)
}
