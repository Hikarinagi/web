import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { isApiError } from '~/utils/api/error'
import type { DownloadFormat, DownloadKind, DownloadQuote } from './types'
import { useDownloadCard } from './useDownloadCard'
import { useDownloadEngine } from './useDownloadEngine'

export type DownloadBlock = 'DAILY_LIMIT' | 'FILE_TOO_LARGE' | 'MEMORY_LIMIT'

const QUOTE_DELAY_MS = 300

export function useDownloadDialog(options: {
  kind: DownloadKind
  seriesId: () => number
  format: Ref<DownloadFormat>
}) {
  const engine = useDownloadEngine()
  const open = ref(false)
  const selected = ref<number[]>([])
  const quote = shallowRef<DownloadQuote | null>(null)
  const quoting = ref(false)
  const creating = ref(false)
  const taskId = ref<number | null>(null)
  let controller: AbortController | null = null
  let revision = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  const run = computed(() =>
    taskId.value === null ? null : (engine.runs.get(taskId.value) ?? null),
  )
  const sink = computed(() => engine.preferredSink())
  const memoryLimited = computed(
    () =>
      sink.value === 'memory' &&
      !!quote.value &&
      quote.value.files.some(file => file.bytes > quote.value!.limits.memory_fallback_max_bytes),
  )
  const blocked = computed<DownloadBlock | null>(
    () => quote.value?.blocked ?? (memoryLimited.value ? 'MEMORY_LIMIT' : null),
  )
  const needsCard = computed(
    () => !!quote.value && quote.value.required_cards > quote.value.cards.available,
  )
  const canStart = computed(
    () =>
      !!quote.value &&
      !quoting.value &&
      !creating.value &&
      !blocked.value &&
      selected.value.length > 0 &&
      quote.value.series_id === options.seriesId(),
  )

  async function refreshQuote() {
    if (!open.value || run.value) return
    controller?.abort()
    const version = ++revision
    if (!selected.value.length) {
      quote.value = null
      quoting.value = false
      return
    }
    controller = new AbortController()
    quoting.value = true
    try {
      const result = await hikariRequest('/api/v3/user/me/downloads/quotes', {
        method: 'post',
        body: {
          kind: options.kind,
          series_id: options.seriesId(),
          format: options.format.value,
          item_ids: [...selected.value],
        },
        signal: controller.signal,
      })
      if (version !== revision) return
      quote.value = result
    } catch {
      if (version === revision) quote.value = null
    } finally {
      if (version === revision) quoting.value = false
    }
  }

  function scheduleQuote() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => void refreshQuote(), QUOTE_DELAY_MS)
  }

  watch([selected, options.format], scheduleQuote, { deep: true })
  watch(open, value => {
    if (!value) return
    taskId.value = null
    void refreshQuote()
  })

  const { purchasing, purchase } = useDownloadCard(
    () => quote.value?.cards ?? null,
    async () => {
      if (open.value) await refreshQuote()
    },
  )

  async function save() {
    const current = quote.value
    if (!current) return
    if (needsCard.value) {
      purchase(Math.max(1, current.required_cards - current.cards.available))
      return
    }
    if (!canStart.value) return
    creating.value = true
    try {
      const chosen = sink.value
      let directory: FileSystemDirectoryHandle | null = null
      if (chosen === 'fs') {
        directory = await engine.pickDirectory()
        if (!directory) return
      }
      const task = await hikariRequest('/api/v3/user/me/downloads', {
        method: 'post',
        body: {
          kind: options.kind,
          series_id: options.seriesId(),
          format: options.format.value,
          item_ids: [...selected.value],
          max_cards: current.required_cards,
        },
      })
      const manifest = await engine.requestManifest(task.id)
      engine.start({ task, manifest, sink: chosen, directory })
      taskId.value = task.id
    } catch (error) {
      if (isApiError(error)) await refreshQuote()
    } finally {
      creating.value = false
    }
  }

  function pause() {
    if (taskId.value !== null) engine.pause(taskId.value)
  }

  async function resume() {
    const current = run.value
    if (!current) return
    await engine.resume({ id: current.taskId, title: current.title, format: options.format.value })
  }

  function background() {
    open.value = false
  }

  return {
    open,
    selected,
    quote,
    quoting,
    creating,
    purchasing,
    run,
    sink,
    blocked,
    needsCard,
    canStart,
    refreshQuote,
    save,
    pause,
    resume,
    background,
  }
}
