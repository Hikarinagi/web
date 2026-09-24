import { SCENE_MOMENTS } from './moments'

export function useMoments(selected: Ref<boolean>, interacting: Ref<boolean>) {
  const idle = ref<string>('walk')
  const ready = ref(new Set<string>())
  const reduced = usePreferredReducedMotion()
  const visibility = useDocumentVisibility()
  const fade = computed(() => (reduced.value === 'reduce' ? 0 : 0.4))
  const moments = SCENE_MOMENTS.map(item => item.id)
  const available = computed(() => moments.filter(id => ready.value.has(id)))
  let remaining = moments.filter(id => id !== idle.value)

  const current = computed(() => {
    if (selected.value && ready.value.has('desk-smile')) return 'desk-smile'
    if ((selected.value || interacting.value) && ready.value.has('desk')) return 'desk'
    return idle.value
  })

  function advance() {
    const candidates = available.value.filter(id => id !== idle.value)
    const unseen = remaining.filter(id => candidates.includes(id))
    const pool = unseen.length ? unseen : candidates
    const next = pool[Math.floor(Math.random() * pool.length)]
    if (!next) return
    if (!unseen.length) remaining = [...candidates]
    remaining = remaining.filter(id => id !== next)
    idle.value = next
  }

  const { pause, resume } = useIntervalFn(advance, 15000, { immediate: false })
  const running = computed(
    () => !selected.value && !interacting.value && reduced.value !== 'reduce',
  )
  watchEffect(() => {
    if (running.value && visibility.value === 'visible' && available.value.length > 1) resume()
    else pause()
  })

  function markReady(id: string) {
    ready.value = new Set([...ready.value, id])
  }

  return { current, fade, markReady }
}
