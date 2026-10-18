import { useMediaQuery } from '@vueuse/core'
import {
  accountFont,
  accountTheme,
  deviceDefaults,
  type ReaderDeviceSettings,
  type ReaderFontId,
} from './settings'
import { readerTheme, shellStyle } from './themes'

export function useReaderSettings(account: { theme_index: number; font_family: string } | null) {
  const phone = useMediaQuery('(max-width: 639.98px)')
  const device = useLocalStorage<ReaderDeviceSettings>(
    'hikari:light-novel-reader:device',
    deviceDefaults(phone.value),
    { mergeDefaults: true },
  )
  const theme = ref(accountTheme(account?.theme_index))
  const font = ref<ReaderFontId>(accountFont(account?.font_family))
  const systemDark = usePreferredDark()
  const palette = computed(() => readerTheme(theme.value, systemDark.value))

  useHead({
    style: [
      { key: 'light-novel-reader-theme', textContent: computed(() => shellStyle(theme.value)) },
    ],
  })

  function persist(body: { theme_index?: number; font_family?: string }) {
    void hikariRequest('/api/v3/reader/settings', { method: 'patch', body }).catch(() => undefined)
  }

  function setTheme(index: number) {
    if (theme.value === index) return
    theme.value = index
    persist({ theme_index: index })
  }

  function setFont(id: ReaderFontId) {
    if (font.value === id) return
    font.value = id
    persist({ font_family: id })
  }

  function update<K extends keyof ReaderDeviceSettings>(key: K, value: ReaderDeviceSettings[K]) {
    device.value = { ...device.value, [key]: value }
  }

  function reset() {
    device.value = deviceDefaults(phone.value)
    setTheme(0)
  }

  return { device, theme, font, palette, phone, setTheme, setFont, update, reset }
}

export type ReaderSettings = ReturnType<typeof useReaderSettings>
