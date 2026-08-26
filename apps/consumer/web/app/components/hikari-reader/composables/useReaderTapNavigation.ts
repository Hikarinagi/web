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

/**
 * An image click only reaches us once Rito has the blob, which is async on a
 * cache miss — long after the tap already turned the page. Every other content
 * hit (annotation, link, footnote) is emitted synchronously and is caught by
 * `consumeSuppressedTap` instead. Within this window the turn is taken back.
 */
const LATE_CONTENT_TAP_MS = 500

interface UseReaderTapNavigationOptions {
  device: Ref<HikariReaderDeviceSettings>
  isCoarsePointer: Ref<boolean>
  isLoaded: Ref<boolean>
  surface: Ref<HTMLElement | null>
  currentSpread: Ref<number>
  /** Cuts to a spread without animating — used to undo a turn. */
  jumpToSpread: (index: number) => void
  toggleToolbar: () => void
  next: () => void
  previous: () => void
  /** While true the surface belongs to something else (e.g. the intro overlay). */
  blocked?: Ref<boolean>
}

/**
 * Owns what a tap on the reading surface means. By default only touch input
 * reaches here and a tap toggles the toolbar. With `tap_zones` on, the surface
 * is split into fixed left / center / right zones and mouse input counts too,
 * because that mode is an explicit opt-in for devices where dragging a page is
 * not viable.
 */
export function useReaderTapNavigation(options: UseReaderTapNavigationOptions) {
  const enabled = computed(
    () =>
      !options.blocked?.value && (options.isCoarsePointer.value || options.device.value.tap_zones),
  )

  let contentTapSuppressed = false
  let suppressTimer: number | null = null
  let pendingTurn: { from: number; to: number; at: number } | null = null

  /** Turn the page, remembering enough to take it back if content claims the tap. */
  function turn(step: () => void) {
    const from = options.currentSpread.value
    step()
    const to = options.currentSpread.value
    pendingTurn = from === to ? null : { from, to, at: performance.now() }
  }

  function revertLateTurn() {
    const turned = pendingTurn
    pendingTurn = null
    if (!turned) return
    if (performance.now() - turned.at > LATE_CONTENT_TAP_MS) return
    // Only undo if nothing else has moved since; the reader may have been
    // paged again while the blob was still decoding.
    if (options.currentSpread.value !== turned.to) return
    options.jumpToSpread(turned.from)
  }

  /** Called by content handlers to claim the tap that is still in flight. */
  function suppressTap() {
    if (!enabled.value) return
    revertLateTurn()
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
    if (!options.device.value.tap_zones) {
      options.toggleToolbar()
      return
    }
    const rect = options.surface.value?.getBoundingClientRect()
    const zone = resolveTapZone(point.x - (rect?.left ?? 0), rect?.width ?? window.innerWidth)
    if (zone === 'previous') turn(options.previous)
    else if (zone === 'next') turn(options.next)
    else options.toggleToolbar()
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
