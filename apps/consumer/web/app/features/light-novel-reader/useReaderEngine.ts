import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { preloadReaderRuntime } from '@ritojs/core'
import { isApiError } from '~/utils/api/error'
import { createStack, effectOf, locatorOf, spreadOf } from './engine'
import { cachedFont, fontCatalogue, fontFace, loadFont, type ReaderFont } from './fonts'
import { cachedSkeleton, openPublication, startSession } from './publication'
import type { ReaderHighlights } from './useReaderHighlights'
import type { ReaderSettings } from './useReaderSettings'

export type ReaderPhase = 'prepare' | 'download' | 'layout' | 'ready' | 'failed'
export type ReaderFailure =
  'sessions' | 'quota' | 'changed' | 'missing' | 'withdrawn' | 'unavailable' | 'network' | 'engine'

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
  const received = ref({ loaded: 0, total: 0, font: false })
  const stack = shallowRef<Awaited<ReturnType<typeof createStack>> | null>(null)
  const font = shallowRef<ReaderFont | null>(null)
  let generation = 0

  const spread = () =>
    spreadOf(device.value.spread, options.size.value, device.value.margin, device.value.fontSize)

  async function release() {
    const current = stack.value
    stack.value = null
    current?.controller.dispose()
    current?.canvas.remove()
    await current?.reader.dispose()
  }

  async function open(at?: unknown) {
    const id = ++generation
    await release()
    phase.value = 'prepare'
    failure.value = null
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
      const created = await createStack({
        publication,
        size: options.size.value,
        margin: device.value.margin,
        spread: spread(),
        fontSize: device.value.fontSize,
        lineHeight: device.value.lineHeight,
        theme: palette.value,
        face: fontFace(chosen.sha256, bytes),
        effect: device.value.effect,
        initialLocator: locatorOf(at ?? options.position()),
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
      created.controller.mount(options.host.value)
      font.value = chosen
      stack.value = created
      phase.value = 'ready'
    } catch (error) {
      if (id !== generation) return
      const known = isApiError(error) ? FAILURES[error.code] : undefined
      failure.value = known ?? (phase.value === 'layout' ? 'engine' : 'network')
      phase.value = 'failed'
    }
  }

  watch(
    () => [options.size.value, device.value.margin, device.value.spread] as const,
    () => {
      const controller = stack.value?.controller
      if (!controller) return
      controller.setSpreadMode(spread())
      controller.resize(options.size.value.width, options.size.value.height, device.value.margin)
    },
  )
  watch(
    () => [device.value.fontSize, device.value.lineHeight] as const,
    ([fontSize, lineHeight]) => {
      const controller = stack.value?.controller
      if (!controller) return
      controller.setSpreadMode(spread())
      controller.setTypography({ fontSize, lineHeight, lineHeightForce: true })
    },
  )
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

  return { phase, failure, received, stack, font, open, swapFont, release }
}

export type ReaderEngine = ReturnType<typeof useReaderEngine>
