import type { components } from '@hikarinagi/api-contract/v3'
import type { BackendNovelSegment, NovelSegmentChange } from '~/features/workbench/workbench'

export type SegmentFilter = 'all' | 'empty' | 'machine' | 'revise'
export type SaveState = 'saving' | 'saved' | 'error'
type QaIssue = components['schemas']['NovelQaIssueDto']

const SAVE_DELAY = 800

export function useTranslationEditor(
  chapterId: MaybeRefOrGetter<number>,
  initial: BackendNovelSegment[],
) {
  const auth = useAuthStore()
  const segments = ref<BackendNovelSegment[]>(initial)
  const drafts = reactive(new Map<string, string>())
  const states = reactive(new Map<string, SaveState>())
  const issues = reactive(new Map<string, QaIssue[]>())
  const activeId = ref<string | null>(null)
  const filter = ref<SegmentFilter>('all')
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const queued = new Set<string>()

  const mine = (segment: BackendNovelSegment) =>
    segment.translations.find(item => item.user.id === auth.user?.id) ?? null
  const chosen = (segment: BackendNovelSegment) =>
    segment.translations.find(item => item.selected) ?? null

  const texts = computed(() => segments.value.filter(segment => segment.kind === 'TEXT'))
  const numbers = computed(() => new Map(texts.value.map((segment, index) => [segment.id, index])))
  const visible = computed(() => {
    if (filter.value === 'all') return segments.value
    return texts.value.filter(segment => {
      if (segment.id === activeId.value) return true
      if (filter.value === 'empty') return segment.state === 0 && !drafts.get(segment.id)
      if (filter.value === 'revise') return segment.state === 10
      return !!chosen(segment)?.machine
    })
  })
  const done = computed(() => texts.value.filter(segment => segment.state >= 20).length)
  const active = computed(
    () => segments.value.find(segment => segment.id === activeId.value) ?? null,
  )
  const saving = computed(() => [...states.values()].some(state => state === 'saving'))
  const failed = computed(() =>
    [...states.entries()].filter(([, state]) => state === 'error').map(([id]) => id),
  )

  function textOf(segment: BackendNovelSegment): string {
    const own = mine(segment)
    const selected = chosen(segment)
    return drafts.get(segment.id) ?? own?.text ?? selected?.proofread_text ?? selected?.text ?? ''
  }

  function patch(segmentId: string, next: Partial<BackendNovelSegment>) {
    segments.value = segments.value.map(row => (row.id === segmentId ? { ...row, ...next } : row))
  }

  async function save(segmentId: string) {
    const timer = timers.get(segmentId)
    if (timer) clearTimeout(timer)
    timers.delete(segmentId)
    const segment = segments.value.find(row => row.id === segmentId)
    const text = drafts.get(segmentId)
    if (!segment || text === undefined) return
    if (!text.trim() || text === mine(segment)?.text) {
      drafts.delete(segmentId)
      states.delete(segmentId)
      return
    }
    if (states.get(segmentId) === 'saving') {
      queued.add(segmentId)
      return
    }
    states.set(segmentId, 'saving')
    try {
      const result = await hikariRequest('/api/v3/novel-segments/{segment_id}/translations/me', {
        method: 'put',
        path: { segment_id: segmentId },
        body: { text },
        toast: false,
      })
      const current = segments.value.find(row => row.id === segmentId)
      const others = (current?.translations ?? []).filter(item => item.id !== result.translation.id)
      patch(segmentId, {
        state: result.segment_state,
        translations: [result.translation, ...others].sort(
          (a, b) => Number(b.selected) - Number(a.selected),
        ),
      })
      if (drafts.get(segmentId) === text) drafts.delete(segmentId)
      issues.set(segmentId, result.issues)
      states.set(segmentId, 'saved')
    } catch {
      states.set(segmentId, 'error')
    }
    if (queued.delete(segmentId)) await save(segmentId)
  }

  function edit(segmentId: string, text: string) {
    drafts.set(segmentId, text)
    const timer = timers.get(segmentId)
    if (timer) clearTimeout(timer)
    timers.set(
      segmentId,
      setTimeout(() => void save(segmentId), SAVE_DELAY),
    )
  }

  async function reload() {
    segments.value = await hikariRequest('/api/v3/novel-chapters/{chapter_id}/segments', {
      path: { chapter_id: toValue(chapterId) },
      toast: false,
    })
  }
  const scheduleReload = useDebounceFn(() => reload().catch(() => {}), 600)

  function applyChange(change: NovelSegmentChange) {
    if (change.chapter_id !== toValue(chapterId)) return
    if (change.kind === 'lock' || change.kind === 'unlock') return
    if (change.actor_id === auth.user?.id && change.kind === 'translation') return
    void scheduleReload()
  }

  function flush() {
    for (const id of [...timers.keys()]) void save(id)
  }

  onBeforeUnmount(flush)
  useEventListener('beforeunload', event => {
    if (timers.size || saving.value) event.preventDefault()
  })

  return {
    segments,
    texts,
    numbers,
    visible,
    done,
    drafts,
    states,
    issues,
    activeId,
    active,
    filter,
    saving,
    failed,
    mine,
    chosen,
    textOf,
    edit,
    save,
    flush,
    reload,
    applyChange,
  }
}
