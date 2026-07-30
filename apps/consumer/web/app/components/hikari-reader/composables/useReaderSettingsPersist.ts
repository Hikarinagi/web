import { watch, type Ref } from 'vue'
import type { BackendReaderSettings } from '~/components/hikari-reader/types'

type SettingsPayload = Partial<BackendReaderSettings>

interface ReaderSettingsPersistOptions {
  settings: Ref<BackendReaderSettings>
  debounceMs?: number
}

const DEFAULT_DEBOUNCE_MS = 500

const WATCHED_KEYS = [
  'theme_index',
  'background_color',
  'text_color',
  'font_size',
  'font_family',
  'line_height',
  'margins',
  'keep_screen_on',
  'show_progress',
  'show_time',
] as const satisfies ReadonlyArray<keyof BackendReaderSettings>

export function useReaderSettingsPersist(options: ReaderSettingsPersistOptions) {
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS
  let pending: SettingsPayload = {}
  let timer: ReturnType<typeof setTimeout> | null = null

  function snapshot(value: BackendReaderSettings): SettingsPayload {
    const out: SettingsPayload = {}
    for (const key of WATCHED_KEYS) {
      ;(out as Record<string, unknown>)[key] = value[key]
    }
    return out
  }

  async function flush() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    const payload = pending
    pending = {}
    if (Object.keys(payload).length === 0) return

    try {
      await hikariRequest('/api/v3/reader/settings', {
        method: 'patch',
        body: payload,
        toast: false,
      })
    } catch {
      return
    }
  }

  watch(
    () => snapshot(options.settings.value),
    (next, previous) => {
      const diff: SettingsPayload = {}
      for (const key of WATCHED_KEYS) {
        if (!Object.is(next[key], previous?.[key])) {
          ;(diff as Record<string, unknown>)[key] = next[key]
        }
      }
      if (Object.keys(diff).length === 0) return

      pending = { ...pending, ...diff }
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        void flush()
      }, debounceMs)
    },
    { deep: true },
  )

  function flushOnUnload() {
    if (Object.keys(pending).length === 0) return
    const payload = { ...pending }
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    pending = {}
    void hikariRequest('/api/v3/reader/settings', {
      method: 'patch',
      body: payload,
      toast: false,
    }).catch(() => {})
  }

  if (import.meta.client) {
    window.addEventListener('beforeunload', flushOnUnload)
    window.addEventListener('pagehide', flushOnUnload)
  }

  onBeforeUnmount(() => {
    flushOnUnload()
    if (import.meta.client) {
      window.removeEventListener('beforeunload', flushOnUnload)
      window.removeEventListener('pagehide', flushOnUnload)
    }
  })

  return { flush }
}
