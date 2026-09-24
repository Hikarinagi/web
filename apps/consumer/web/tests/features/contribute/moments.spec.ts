import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { SCENE_MOMENTS } from '~/features/contribute/moments'
import { useMoments } from '~/features/contribute/useMoments'

const visibility = ref<'visible' | 'hidden'>('visible')
const reduced = ref<'reduce' | 'no-preference'>('no-preference')

vi.mock('@vueuse/core', async importOriginal => ({
  ...(await importOriginal<typeof import('@vueuse/core')>()),
  useDocumentVisibility: () => visibility,
  usePreferredReducedMotion: () => reduced,
}))

let scope: EffectScope

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
  visibility.value = 'visible'
  reduced.value = 'no-preference'
  scope = effectScope()
})

afterEach(() => {
  scope.stop()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('rotates only shelf moments every 15 seconds, without adjacent repeats', async () => {
  const scene = scope.run(() => useMoments(ref(false), ref(false)))!
  for (const id of [...SCENE_MOMENTS.map(item => item.id), 'desk', 'desk-smile'])
    scene.markReady(id)
  await nextTick()

  expect(scene.fade.value).toBe(0.4)
  await vi.advanceTimersByTimeAsync(14999)
  expect(scene.current.value).toBe('walk')

  const shelfIds = SCENE_MOMENTS.map(item => item.id)
  let previous = scene.current.value
  await vi.advanceTimersByTimeAsync(1)
  for (let step = 0; step < 16; step++) {
    expect(shelfIds).toContain(scene.current.value)
    expect(scene.current.value).not.toBe(previous)
    previous = scene.current.value
    await vi.advanceTimersByTimeAsync(15000)
  }
})

it('shows the desk only during interaction and restores the shelf immediately afterward', async () => {
  const interacting = ref(false)
  const scene = scope.run(() => useMoments(ref(false), interacting))!
  for (const id of ['walk', 'chase', 'desk']) scene.markReady(id)
  await nextTick()

  interacting.value = true
  await nextTick()
  expect(scene.current.value).toBe('desk')
  await vi.advanceTimersByTimeAsync(30000)
  expect(scene.current.value).toBe('desk')

  interacting.value = false
  await nextTick()
  expect(scene.current.value).toBe('walk')
  await vi.advanceTimersByTimeAsync(14999)
  expect(scene.current.value).toBe('walk')
  await vi.advanceTimersByTimeAsync(1)
  expect(scene.current.value).toBe('chase')
})

it('waits for the smile image before showing it, then leaves it when files are cleared', async () => {
  const selected = ref(true)
  const scene = scope.run(() => useMoments(selected, ref(false)))!
  scene.markReady('walk')
  expect(scene.current.value).toBe('walk')
  scene.markReady('desk')
  expect(scene.current.value).toBe('desk')
  scene.markReady('desk-smile')
  expect(scene.current.value).toBe('desk-smile')
  await nextTick()
  await vi.advanceTimersByTimeAsync(30000)
  expect(scene.current.value).toBe('desk-smile')

  selected.value = false
  expect(scene.current.value).toBe('walk')
})

it('pauses for a hidden page or reduced motion while allowing interaction feedback', async () => {
  const selected = ref(false)
  const scene = scope.run(() => useMoments(selected, ref(false)))!
  for (const id of ['walk', 'chase', 'desk-smile']) scene.markReady(id)
  visibility.value = 'hidden'
  await nextTick()
  await vi.advanceTimersByTimeAsync(30000)
  expect(scene.current.value).toBe('walk')

  visibility.value = 'visible'
  reduced.value = 'reduce'
  await nextTick()
  await vi.advanceTimersByTimeAsync(30000)
  expect(scene.current.value).toBe('walk')
  expect(scene.fade.value).toBe(0)
  selected.value = true
  expect(scene.current.value).toBe('desk-smile')
})
