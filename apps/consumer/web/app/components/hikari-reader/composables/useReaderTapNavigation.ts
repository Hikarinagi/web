import type { Ref } from 'vue'
import { computed, onBeforeUnmount } from 'vue'
import { resolveTapZone, type HikariReaderDeviceSettings } from '../lib/device-settings'
import { useReaderTapDetector, type ReaderTapPoint } from './useReaderTapDetector'

/**
 * Rito reports content hits (image / link / footnote) from its own canvas
 * handlers, which run just before our surface-level release handler. This is
 * how long that claim stays valid.
 */
const CONTENT_TAP_SUPPRESS_MS = 360

interface UseReaderTapNavigationOptions {
  device: Ref<HikariReaderDeviceSettings>
  isLoaded: Ref<boolean>
  surface: Ref<HTMLElement | null>
  next: () => void
  previous: () => void
  /** While true the surface belongs to something else (e.g. the intro overlay). */
  blocked?: Ref<boolean>
}

/**
 * Owns what a tap on the reading surface means, which is only ever paging: with
 * `tap_zones` on the surface is split into fixed left / center / right zones.
 * The toolbar is not summoned from the surface at all — the context menu is its
 * single entry point.
 */
export function useReaderTapNavigation(options: UseReaderTapNavigationOptions) {
  const enabled = computed(() => !options.blocked?.value && options.device.value.tap_zones)

  let contentTapSuppressed = false
  let suppressTimer: number | null = null

  /** Called by content handlers to claim the tap that is still in flight. */
  function suppressTap() {
    if (!enabled.value) return
    contentTapSuppressed = true
    if (suppressTimer !== null) window.clearTimeout(suppressTimer)
    suppressTimer = window.setTimeout(() => {
      contentTapSuppressed = false
      suppressTimer = null
    }, CONTENT_TAP_SUPPRESS_MS)
  }

  function consumeSuppressedTap() {
    const suppressed = contentTapSuppressed
    contentTapSuppressed = false
    if (suppressTimer !== null) {
      window.clearTimeout(suppressTimer)
      suppressTimer = null
    }
    return suppressed
  }

  function onTap(point: ReaderTapPoint) {
    const rect = options.surface.value?.getBoundingClientRect()
    const zone = resolveTapZone(point.x - (rect?.left ?? 0), rect?.width ?? window.innerWidth)
    if (zone === 'previous') options.previous()
    else if (zone === 'next') options.next()
  }

  const detector = useReaderTapDetector({
    enabled,
    isLoaded: options.isLoaded,
    onTap,
    consumeSuppressedTap,
  })

  onBeforeUnmount(() => {
    if (suppressTimer !== null) window.clearTimeout(suppressTimer)
  })

  return { ...detector, suppressTap }
}
