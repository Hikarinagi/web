import { provideUiLocale, zhCN, type UiMessages } from '@hina-ui/vue'

const HINA_MESSAGES: Record<string, UiMessages> = { 'zh-CN': zhCN }

export function useLocaleRoot() {
  const { locale } = useI18n()
  provideUiLocale(() => HINA_MESSAGES[locale.value] ?? zhCN)
  useHead({ htmlAttrs: { lang: locale } })
}
