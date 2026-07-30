import { Moon, Sun, SunMoon } from '@lucide/vue'

type ThemePreference = 'system' | 'light' | 'dark'

const THEME_MODES = [
  { value: 'system', label: '跟随系统', icon: SunMoon },
  { value: 'light', label: '浅色模式', icon: Sun },
  { value: 'dark', label: '深色模式', icon: Moon },
] as const satisfies readonly { value: ThemePreference; label: string; icon: typeof SunMoon }[]

export function useThemeMode() {
  const colorMode = useColorMode()

  const current = computed(
    () => THEME_MODES.find(mode => mode.value === colorMode.preference) ?? THEME_MODES[0],
  )

  function cycle() {
    const index = THEME_MODES.findIndex(mode => mode.value === current.value.value)
    const next = THEME_MODES[(index + 1) % THEME_MODES.length] ?? THEME_MODES[0]
    colorMode.preference = next.value
  }

  return { current, cycle }
}
