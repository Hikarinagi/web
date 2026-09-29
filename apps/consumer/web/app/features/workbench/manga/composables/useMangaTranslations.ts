import type { EditableRegion } from './useMangaRegions'

export function useMangaTranslations(find: (id: string) => EditableRegion | undefined) {
  const auth = useAuthStore()
  const drafts = reactive(new Map<string, string>())
  const states = reactive(new Map<string, 'saving' | 'error'>())
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const running = new Map<string, Promise<boolean>>()

  const mine = (region: EditableRegion) =>
    region.translations.find(row => row.user.id === auth.user?.id) ?? null
  const textOf = (region: EditableRegion) => drafts.get(region.id) ?? mine(region)?.text ?? ''
  const failed = computed(() =>
    [...states].filter(([, state]) => state === 'error').map(([id]) => id),
  )
  const saving = computed(() => [...states.values()].includes('saving'))

  function edit(id: string, text: string) {
    drafts.set(id, text)
    clearTimeout(timers.get(id))
    timers.set(
      id,
      setTimeout(() => void save(id), 800),
    )
  }

  async function send(id: string): Promise<boolean> {
    const text = drafts.get(id)
    const region = find(id)
    if (text === undefined) return true
    if (!region) {
      drafts.delete(id)
      states.delete(id)
      return true
    }
    if (!region.persisted) return true
    const current = mine(region)
    const trimmed = text.trim()
    if (trimmed === (current?.text ?? '')) {
      drafts.delete(id)
      return true
    }
    states.set(id, 'saving')
    try {
      const path = { region_id: id }
      if (!trimmed) {
        const result = await hikariRequest(
          '/api/v3/manga-text-regions/{region_id}/translations/me',
          { method: 'delete', path, toast: false },
        )
        const target = find(id)
        if (target) {
          target.translations = target.translations.filter(row => row.user.id !== auth.user?.id)
          target.state = result.state
        }
      } else {
        const result = await hikariRequest(
          '/api/v3/manga-text-regions/{region_id}/translations/me',
          { method: 'put', path, body: { text: trimmed }, toast: false },
        )
        const target = find(id)
        if (target) {
          target.translations = [
            result.translation,
            ...target.translations.filter(row => row.id !== result.translation.id),
          ]
          target.state = result.region_state
        }
      }
      if (drafts.get(id) === text) drafts.delete(id)
      states.delete(id)
      return true
    } catch {
      states.set(id, 'error')
      return false
    }
  }

  async function save(id: string): Promise<boolean> {
    clearTimeout(timers.get(id))
    timers.delete(id)
    while (running.has(id)) await running.get(id)
    const task = send(id).finally(() => running.delete(id))
    running.set(id, task)
    return task
  }

  function retry() {
    for (const id of failed.value) void save(id)
  }

  useEventListener('beforeunload', event => {
    if (drafts.size) event.preventDefault()
  })
  onBeforeUnmount(() => {
    for (const id of [...drafts.keys()]) void save(id)
  })

  return { drafts, states, failed, saving, mine, textOf, edit, save, retry }
}
