import type { ReadingPosition } from '@ritojs/kit'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderLocation } from './useReaderLocation'

export function useReaderResume(options: {
  volumeId: () => number
  engine: ReaderEngine
  location: ReaderLocation
}) {
  const offer = shallowRef<{ position: ReadingPosition; chapter: string | null } | null>(null)
  const ignored = new Set<number>()

  async function check() {
    const stack = options.engine.stack.value
    const local = options.location.position.value
    const compare = stack?.reader.interactions?.compareSourcePositions
    if (!stack || !local?.sourceLocator?.sourcePoint || !compare) return
    const state = await hikariRequest('/api/v3/reader/volumes/{volume_id}/state', {
      path: { volume_id: options.volumeId() },
      toast: false,
    }).catch(() => null)
    const remote = state?.progress?.position as ReadingPosition | undefined
    const point = remote?.sourceLocator?.sourcePoint
    if (!remote || !point || ignored.has(remote.timestamp)) return
    if (remote.timestamp <= local.timestamp) return
    const order = await compare(
      { href: remote.sourceLocator!.href, point },
      { href: local.sourceLocator.href, point: local.sourceLocator.sourcePoint },
    )
    if (order !== 1 || options.engine.stack.value !== stack) return
    offer.value = { position: remote, chapter: state?.progress?.current_chapter_title ?? null }
  }

  function ignore() {
    if (offer.value) ignored.add(offer.value.position.timestamp)
    offer.value = null
  }

  function accept() {
    const target = offer.value
    offer.value = null
    if (target) void options.engine.stack.value?.controller.goToPosition(target.position)
  }

  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible') void check()
  })
  watch(options.engine.stack, () => (offer.value = null))

  return { offer, ignore, accept }
}

export type ReaderResume = ReturnType<typeof useReaderResume>
