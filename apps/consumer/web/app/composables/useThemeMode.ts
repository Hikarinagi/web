import { Moon, Sun, SunMoon } from '@lucide/vue'
import type { MessageKey } from '~~/i18n/keys'

type ThemePreference = 'system' | 'light' | 'dark'

const THEME_MODES = [
  { value: 'system', label: 'layout.theme.system', icon: SunMoon },
  { value: 'light', label: 'layout.theme.light', icon: Sun },
  { value: 'dark', label: 'layout.theme.dark', icon: Moon },
] as const satisfies readonly { value: ThemePreference; label: MessageKey; icon: typeof SunMoon }[]

export function useThemeMode() {
  const colorMode = useColorMode()

  const current = computed(
    () => THEME_MODES.find(mode => mode.value === colorMode.preference) ?? THEME_MODES[0],
  )

  function set(value: string | undefined) {
    const mode = THEME_MODES.find(item => item.value === value)
    if (mode) colorMode.preference = mode.value
  }

  function cycle() {
    const index = THEME_MODES.findIndex(mode => mode.value === current.value.value)
    const next = THEME_MODES[(index + 1) % THEME_MODES.length] ?? THEME_MODES[0]
    colorMode.preference = next.value
  }

  return { current, modes: THEME_MODES, set, cycle }
}
