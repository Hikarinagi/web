import { createI18n } from 'vue-i18n'
import { DATETIME_FORMATS } from '../../i18n/formats'
import messages from '../../i18n/locales/zh-CN'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': messages },
  datetimeFormats: DATETIME_FORMATS,
})

Object.assign(globalThis, {
  useNuxtApp: () => ({ $i18n: i18n.global }),
  useI18n: () => i18n.global,
})
