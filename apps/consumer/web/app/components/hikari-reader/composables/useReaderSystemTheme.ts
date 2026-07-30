import { watch, type Ref } from 'vue'
import type { BackendReaderSettings } from '~/components/hikari-reader/types'
import { READER_SYSTEM_THEME_INDEX, systemThemeColors } from '../lib/presets'

export function useReaderSystemTheme(settings: Ref<BackendReaderSettings>) {
  const colorMode = useColorMode()

  function resolve() {
    if (settings.value.theme_index !== READER_SYSTEM_THEME_INDEX) return
    const colors = systemThemeColors(colorMode.value === 'dark' ? 'dark' : 'light')
    if (
      settings.value.background_color === colors.background_color &&
      settings.value.text_color === colors.text_color
    )
      return
    settings.value = { ...settings.value, ...colors }
  }

  watch(() => [settings.value.theme_index, colorMode.value] as const, resolve)
  onMounted(resolve)
}
