import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { preloadReaderRuntime, type Reader, type ReaderLocator, type TocEntry } from '@ritojs/core'
import {
  canDrawWithWebGl2,
  createScrollController,
  WebGlUnavailableError,
  type ReadingPosition,
  type ScrollController,
} from '@ritojs/kit'
import { isApiError } from '~/utils/api/error'
import { createStack, effectOf, layoutWhere, locatorOf, marginOf, spreadOf } from './engine'
import { cachedFont, fontCatalogue, fontFace, loadFont, type ReaderFont } from './fonts'
import { cachedSkeleton, openPublication, startSession } from './publication'
import type { ReaderHighlights } from './useReaderHighlights'
import type { ReaderSettings } from './useReaderSettings'

export type ReaderPhase = 'prepare' | 'download' | 'layout' | 'ready' | 'failed'
export type ReaderFailure =
  | 'sessions'
  | 'quota'
  | 'changed'
  | 'missing'
  | 'withdrawn'
  | 'unavailable'
  | 'network'
  | 'engine'
  | 'webgl'

const FAILURES: Partial<Record<string, ReaderFailure>> = {
  [HIKARI_BIZ_CODE.READER_SESSION_LIMITED]: 'sessions',
  [HIKARI_BIZ_CODE.READER_TRANSFER_LIMITED]: 'quota',
  [HIKARI_BIZ_CODE.READER_FILE_CHANGED]: 'changed',
  [HIKARI_BIZ_CODE.READER_EPUB_NOT_AVAILABLE]: 'missing',
  [HIKARI_BIZ_CODE.READER_TRANSLATION_WITHDRAWN]: 'withdrawn',
  [HIKARI_BIZ_CODE.READER_FILE_UNAVAILABLE]: 'unavailable',
}

export function useReaderEngine(options: {
  volumeId: () => number
  position: () => unknown
  host: Readonly<Ref<HTMLElement | null>>
  size: Readonly<Ref<{ width: number; height: number }>>
  settings: ReaderSettings
  highlights: Pick<ReaderHighlights, 'adapter' | 'prepare'>
}) {
  const { device, palette } = options.settings
  const phase = ref<ReaderPhase>('prepare')
  const failure = ref<ReaderFailure | null>(null)
  const fault = ref<string | null>(null)
  const received = ref({ loaded: 0, total: 0, font: false })
  const stack = shallowRef<Awaited<ReturnType<typeof createStack>> | null>(null)
  const view = shallowRef<ScrollController | null>(null)
  const switching = ref(false)
  const font = shallowRef<ReaderFont | null>(null)
  let generation = 0
  let reading: ReaderLocator | undefined
  let turning: Promise<void> = Promise.resolve()

  const spread = () =>
    device.value.flow === 'scrolled'
      ? 'scrolled'
      : spreadOf(
          device.value.spread,
          options.size.value,
          device.value.margin,
          device.value.fontSize,
        )

  const margin = () =>
    marginOf(
      device.value.flow,
      options.size.value.width,
      device.value.margin,
      device.value.pageWidth,
    )

  async function release() {
    const current = stack.value
    const shown = view.value
    stack.value = null
    view.value = null
    shown?.dispose()
    current?.controller.dispose()
    current?.canvas.remove()
    await current?.reader.dispose()
  }

  async function createView(reader: Reader, from: ReaderLocator | undefined) {
    const created = createScrollController(reader, document.createElement('canvas'), {
      a11y: { enabled: true },
    })
    reading = from
    created.on('position', ({ locator }) => (reading = locator))
    if (from) await created.scrollToLocator(from)
    return created
  }

  async function switchFlow() {
    const current = stack.value
    const scrolled = device.value.flow === 'scrolled'
    if (!current || phase.value !== 'ready' || scrolled === (view.value !== null)) return
    const { reader, controller } = current
    const stale = () => stack.value !== current
    const layOut = () =>
      reader.updateLayout(options.size.value.width, options.size.value.height, spread(), margin())
    switching.value = true
    try {
      if (scrolled) {
        const from = controller.position?.sourceLocator
        controller.suspend()
        layOut()
        await layoutWhere(reader, true)
        const created = await createView(reader, from)
        if (stale() || !options.host.value) {
          created.dispose()
          return
        }
        created.mount(options.host.value)
        view.value = created
        return
      }
      view.value?.dispose()
      view.value = null
      if (reading) await reader.navigateToLocator?.(reading)
      if (stale()) return
      layOut()
      await layoutWhere(reader, false)
      if (!stale()) controller.resume()
    } catch (error) {
      if (stale()) return
      failure.value = 'engine'
      fault.value = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      phase.value = 'failed'
    } finally {
      switching.value = false
    }
  }

  const spreads = () => {
    const current = stack.value
    if (!current) return []
    return view.value ? current.reader.spreads : current.controller.spreads
  }

  function goTo(position: ReadingPosition) {
    const shown = view.value
    if (!shown) return stack.value?.controller.goToPosition(position)
    return position.sourceLocator ? shown.scrollToLocator(position.sourceLocator) : undefined
  }

  function goToEntry(entry: TocEntry) {
    const current = stack.value
    const shown = view.value
    if (!shown) {
      current?.controller.navigateToTocEntry(entry)
      return
    }
    const page = current?.reader.findPage(entry)
    const target = page == null ? undefined : current?.reader.findSpread(page)
    if (target != null) shown.scrollToSpread(target)
    else {
      const [href, anchorId] = entry.href.split('#')
      void shown.scrollToLocator({ href: href!, ...(anchorId && { anchorId }) })
    }
  }

  function clearSelection() {
    if (view.value) view.value.clearSelection()
    else stack.value?.controller.clearSelection()
  }

  async function open(at?: unknown) {
    const id = ++generation
    await release()
    phase.value = 'prepare'
    failure.value = null
    fault.value = null
    if (!canDrawWithWebGl2()) {
      failure.value = 'webgl'
      phase.value = 'failed'
      return
    }
    try {
      const volumeId = options.volumeId()
      const [session, catalogue] = await Promise.all([
        startSession(volumeId),
        fontCatalogue(),
        preloadReaderRuntime(),
      ])
      const chosen =
        catalogue.find(item => item.id === options.settings.font.value) ??
        catalogue.find(item => item.id === 'original')!
      const [fontHit, skeletonHit] = await Promise.all([
        cachedFont(chosen.sha256),
        cachedSkeleton(session),
      ])
      if (id !== generation) return
      const loaded = { font: 0, skeleton: 0 }
      const total = {
        font: fontHit ? 0 : chosen.bytes,
        skeleton: skeletonHit ? 0 : session.publication.skeleton.bytes,
      }
      const sync = () => {
        received.value = {
          loaded: loaded.font + loaded.skeleton,
          total: total.font + total.skeleton,
          font: total.font > 0,
        }
      }
      sync()
      if (received.value.total > 0) phase.value = 'download'
      const [bytes, publication] = await Promise.all([
        loadFont(chosen, {
          onProgress: progress => {
            loaded.font = progress.loaded
            sync()
          },
        }),
        openPublication(volumeId, session, progress => {
          loaded.skeleton = progress.loaded
          sync()
        }),
      ])
      if (id !== generation) return
      phase.value = 'layout'
      const initialLocator = locatorOf(at ?? options.position())
      const scrolled = device.value.flow === 'scrolled'
      const created = await createStack({
        publication,
        size: options.size.value,
        margin: margin(),
        spread: spread(),
        fontSize: device.value.fontSize,
        lineHeight: device.value.lineHeight,
        theme: palette.value,
        face: fontFace(chosen.sha256, bytes),
        effect: device.value.effect,
        initialLocator,
        annotations: options.highlights.adapter,
        paintPage: (context, { bookPageIndex, width, height, margins }) => {
          if (bookPageIndex == null) return
          context.font = `11px ${getComputedStyle(document.body).fontFamily}`
          context.fillStyle = palette.value.text
          context.globalAlpha = 0.45
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(
            `${bookPageIndex + 1}`,
            width / 2,
            height - Math.max(10, margins.bottom / 2),
          )
        },
        prepare: options.highlights.prepare,
      })
      if (id !== generation || !options.host.value) {
        created.controller.dispose()
        await created.reader.dispose()
        return
      }
      if (scrolled) created.controller.suspend()
      created.controller.mount(options.host.value)
      const shown = scrolled ? await createView(created.reader, initialLocator) : null
      if (id !== generation || !options.host.value) {
        shown?.dispose()
        created.controller.dispose()
        await created.reader.dispose()
        return
      }
      shown?.mount(options.host.value)
      font.value = chosen
      view.value = shown
      stack.value = created
      phase.value = 'ready'
      turning = turning.then(switchFlow)
    } catch (error) {
      if (id !== generation) return
      const known =
        error instanceof WebGlUnavailableError
          ? 'webgl'
          : isApiError(error)
            ? FAILURES[error.code]
            : undefined
      failure.value = known ?? (phase.value === 'layout' ? 'engine' : 'network')
      fault.value = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      phase.value = 'failed'
    }
  }

  watch(
    () => device.value.flow,
    () => (turning = turning.then(switchFlow)),
  )
  watch(
    [
      () => options.size.value,
      () => device.value.margin,
      () => device.value.pageWidth,
      () => device.value.spread,
    ],
    () => {
      const controller = stack.value?.controller
      if (!controller) return
      controller.setSpreadMode(spread())
      controller.resize(options.size.value.width, options.size.value.height, margin())
    },
  )
  watch([() => device.value.fontSize, () => device.value.lineHeight], ([fontSize, lineHeight]) => {
    const controller = stack.value?.controller
    if (!controller) return
    controller.setSpreadMode(spread())
    controller.setTypography({ fontSize, lineHeight, lineHeightForce: true })
  })
  watch(palette, theme =>
    stack.value?.controller.setTheme({
      backgroundColor: theme.background,
      foregroundColor: theme.text,
    }),
  )
  watch(
    () => device.value.effect,
    effect => stack.value?.controller.configureTransition({ effect: effectOf(effect) }),
  )

  async function swapFont(next: ReaderFont, bytes: ArrayBuffer) {
    const controller = stack.value?.controller
    const previous = font.value
    if (!controller || !previous || previous.sha256 === next.sha256) return
    await controller.addFontFaces([fontFace(next.sha256, bytes)])
    await controller.removeFontFaces([previous.sha256])
    font.value = next
  }

  onBeforeUnmount(() => {
    generation += 1
    void release()
  })

  return {
    phase,
    failure,
    fault,
    received,
    stack,
    view,
    switching,
    font,
    open,
    swapFont,
    release,
    spreads,
    goTo,
    goToEntry,
    clearSelection,
  }
}

export type ReaderEngine = ReturnType<typeof useReaderEngine>
