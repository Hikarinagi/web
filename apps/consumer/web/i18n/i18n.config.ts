import { DATETIME_FORMATS } from './formats'

export default defineI18nConfig(() => ({
  fallbackLocale: 'zh-CN',
  datetimeFormats: DATETIME_FORMATS,
}))
