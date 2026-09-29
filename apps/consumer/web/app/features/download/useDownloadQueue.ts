import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import type { DownloadCards, DownloadPart, DownloadPlan } from './types'
import { useDownloadCard } from './useDownloadCard'
import { saveFile } from './saveFile'

export function useDownloadQueue<Part extends DownloadPart>(options: {
  id: () => number
  load: (id: number) => Promise<DownloadCards>
  plan: (
    id: number,
    selected: number[],
    signal: AbortSignal,
  ) => Promise<DownloadPlan & { parts: Part[] }>
  file: (id: number, part: Part, signal: AbortSignal) => Promise<ArrayBuffer>
  mime: string
}) {
  const open = ref(false)
  const loading = ref(false)
  const busy = ref(false)
  const quoting = ref(false)
  const selected = ref<number[]>([])
  const parts = shallowRef<Part[]>([])
  const completed = ref(0)
  const status = shallowRef<DownloadCards | null>(null)
  const quote = shallowRef<(DownloadPlan & { parts: Part[] }) | null>(null)
  let transfer: AbortController | null = null
  let preview: AbortController | null = null
  let revision = 0
  const required = computed(() => quote.value?.required_cards ?? 0)
  const needsCard = computed(() => !!status.value && required.value > status.value.available)
  const finished = computed(() => parts.value.length > 0 && completed.value === parts.value.length)
  const { purchasing, purchase } = useDownloadCard(
    () => status.value,
    async cards => {
      status.value = cards
      if (open.value) await refreshQuote()
    },
  )

  async function refreshQuote() {
    if (!open.value || !selected.value.length || busy.value) return
    preview?.abort()
    const version = ++revision
    const controller = new AbortController()
    preview = controller
    const target = options.id()
    quoting.value = true
    try {
      const result = await options.plan(target, [...selected.value], controller.signal)
      if (version !== revision || target !== options.id()) return
      quote.value = result
      status.value = result
      if (parts.value.length) {
        const unchanged = parts.value.slice(0, completed.value).every((part, index) => {
          const next = result.parts[index]
          return next?.file_name === part.file_name && next.revision === part.revision
        })
        if (unchanged) parts.value = result.parts
        else reselect()
      }
    } catch {
      if (version === revision) quote.value = null
    } finally {
      if (version === revision) quoting.value = false
    }
  }

  watch(
    selected,
    () => {
      revision++
      preview?.abort()
      quoting.value = false
      quote.value = null
      reselect()
      void refreshQuote()
    },
    { flush: 'sync' },
  )
  watch(
    open,
    value => {
      if (value) void refreshQuote()
    },
    { flush: 'sync' },
  )
  watch(options.id, () => {
    stop()
    revision++
    preview?.abort()
    open.value = false
    quoting.value = false
    status.value = null
    quote.value = null
    reselect()
  })

  async function prepare() {
    if (loading.value || busy.value || purchasing.value || open.value) return
    if (status.value) {
      open.value = true
      return
    }
    const target = options.id()
    loading.value = true
    try {
      const cards = await options.load(target)
      if (target !== options.id()) return
      status.value = cards
      open.value = true
    } catch {
      open.value = false
    } finally {
      loading.value = false
    }
  }

  async function download() {
    if (busy.value || quoting.value || purchasing.value || !quote.value || !selected.value.length)
      return
    if (needsCard.value) {
      purchase(Math.max(1, required.value - (status.value?.available ?? 0)))
      return
    }
    if (!parts.value.length || finished.value) {
      parts.value = quote.value.parts
      completed.value = 0
    }
    busy.value = true
    const target = options.id()
    transfer = new AbortController()
    const signal = transfer.signal
    let failed = false
    try {
      while (completed.value < parts.value.length) {
        signal.throwIfAborted()
        const part = parts.value[completed.value]!
        const data = await options.file(target, part, signal)
        signal.throwIfAborted()
        saveFile(data, part.file_name, options.mime)
        completed.value++
      }
      open.value = false
    } catch {
      failed = true
    } finally {
      busy.value = false
      transfer = null
      if (failed && target === options.id() && open.value) await refreshQuote()
    }
  }

  async function direct(part: Part) {
    if (busy.value || purchasing.value) return
    busy.value = true
    transfer = new AbortController()
    const signal = transfer.signal
    try {
      const data = await options.file(options.id(), part, signal)
      signal.throwIfAborted()
      saveFile(data, part.file_name, options.mime)
    } catch {
      return
    } finally {
      busy.value = false
      transfer = null
    }
  }

  function stop() {
    transfer?.abort()
  }
  function reselect() {
    parts.value = []
    completed.value = 0
  }
  onScopeDispose(() => {
    stop()
    revision++
    preview?.abort()
  })

  return {
    open,
    loading,
    busy,
    quoting,
    selected,
    parts,
    completed,
    status,
    quote,
    required,
    needsCard,
    finished,
    purchasing,
    prepare,
    refreshQuote,
    download,
    direct,
    stop,
    reselect,
  }
}
