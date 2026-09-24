import type { components } from '@hikarinagi/api-contract/v3'
import { promiseTimeout } from '@vueuse/core'
import { isApiError } from '~/utils/api/error'
import { isTerminalStatus, type EpubReview } from '~/features/light-novel-volume/epub-correction'
import { readEpubMeta } from './epub-meta'

type IdentifyFile = components['schemas']['EpubIdentifyFileDto']
export type IntakeVolume = components['schemas']['LightNovelVolumeSummaryDto']
export type IntakeSuggestion = components['schemas']['LightNovelVolumeListItemDto']
export type IntakeVerdict =
  components['schemas']['EpubIdentificationDto']['verdict'] | 'unreadable' | 'oversize'

export interface IntakeItem {
  key: string
  file: File
  stage: 'reading' | 'identifying' | 'ready' | 'uploading' | 'submitted' | 'failed'
  verdict: IntakeVerdict | null
  volume: IntakeVolume | null
  suggestion: IntakeSuggestion | null
  review: EpubReview | null
  error: string | null
}

const IDENTIFY_BATCH = 20
const POLL_INTERVAL_MS = 5000
const RATE_LIMIT_WAIT_MS = 20_000
const RATE_LIMIT_RETRIES = 3

let sequence = 0

export function useNovelIntake() {
  const items = ref<IntakeItem[]>([])
  const submitting = ref(false)
  let epubLimit: number | null = null

  const reading = computed(() =>
    items.value.some(item => item.stage === 'reading' || item.stage === 'identifying'),
  )
  const plan = computed(() => {
    const taken = new Set(
      items.value
        .filter(item => item.stage === 'uploading' || item.stage === 'submitted')
        .map(item => item.volume?.id),
    )
    const queue: IntakeItem[] = []
    const duplicates = new Set<string>()
    for (const item of items.value) {
      if (item.stage !== 'ready' || item.verdict !== 'missing' || !item.volume) continue
      if (taken.has(item.volume.id)) duplicates.add(item.key)
      else queue.push(item)
      taken.add(item.volume.id)
    }
    return { queue, duplicates }
  })

  function patch(key: string, value: Partial<IntakeItem>) {
    const item = items.value.find(entry => entry.key === key)
    if (item) Object.assign(item, value)
  }

  async function identify(files: IdentifyFile[]) {
    const data = await hikariRequest('/api/v3/light-novel-volumes/epub/identify', {
      method: 'post',
      body: { files },
      toast: false,
    }).catch(() => null)
    if (!data) {
      for (const { key } of files) {
        patch(key, {
          stage: 'ready',
          verdict: 'unknown',
          error: '自动识别暂不可用，请手动选择对应的卷。',
        })
      }
      return
    }
    for (const result of data.items) {
      const certain = result.verdict === 'missing' || result.verdict === 'present'
      patch(result.key, {
        stage: 'ready',
        verdict: result.verdict,
        volume: certain ? result.volume : null,
        suggestion: certain ? null : result.volume,
      })
    }
  }

  async function add(files: File[]) {
    const fingerprint = (file: File) => `${file.name}:${file.size}:${file.lastModified}`
    const known = new Set(items.value.map(item => fingerprint(item.file)))
    const fresh = files
      .filter(file => !known.has(fingerprint(file)))
      .map((file): IntakeItem => ({
        key: `epub-${++sequence}`,
        file,
        stage: 'reading',
        verdict: null,
        volume: null,
        suggestion: null,
        review: null,
        error: null,
      }))
    if (!fresh.length) return
    items.value.push(...fresh)
    epubLimit ??= await hikariRequest('/api/v3/light-novel-volumes/epub/limits', { toast: false })
      .then(limits => limits.max_epub_bytes)
      .catch(() => null)

    const metas: IdentifyFile[] = []
    for (const { key, file } of fresh) {
      if (epubLimit && file.size > epubLimit) {
        patch(key, { stage: 'ready', verdict: 'oversize' })
        continue
      }
      const meta = await readEpubMeta(file)
      if (!meta) {
        patch(key, { stage: 'ready', verdict: 'unreadable' })
        continue
      }
      patch(key, { stage: 'identifying' })
      metas.push({ key, filename: file.name.slice(0, 255), ...meta })
    }
    for (let start = 0; start < metas.length; start += IDENTIFY_BATCH) {
      await identify(metas.slice(start, start + IDENTIFY_BATCH))
    }
  }

  async function upload(item: IntakeItem, volumeId: number) {
    patch(item.key, { stage: 'uploading', error: null })
    for (let attempt = 0; ; attempt++) {
      const body = new FormData()
      body.append('file', item.file)
      try {
        const review = await hikariRequest('/api/v3/light-novel-volumes/{id}/epub/correction', {
          method: 'post',
          path: { id: volumeId },
          body,
          toast: false,
        })
        patch(item.key, { stage: 'submitted', review })
        return
      } catch (error) {
        if (isApiError(error) && error.status === 429 && attempt < RATE_LIMIT_RETRIES) {
          await promiseTimeout(RATE_LIMIT_WAIT_MS)
          continue
        }
        patch(item.key, {
          stage: 'failed',
          error: isApiError(error) ? error.message : '上传失败，请稍后重试。',
        })
        return
      }
    }
  }

  const { pause, resume } = useIntervalFn(poll, POLL_INTERVAL_MS, { immediate: false })

  async function poll() {
    const waiting = items.value.filter(item => item.review && !isTerminalStatus(item.review.status))
    if (!waiting.length) return pause()
    const submitted = items.value.filter(item => item.review).length
    const page = await hikariRequest('/api/v3/user/me/epub/corrections', {
      query: { page: 1, page_size: Math.min(100, submitted) },
      toast: false,
    }).catch(() => null)
    if (!page) return
    const rows = new Map(page.items.map(row => [row.id, row]))
    for (const item of waiting) {
      const row = item.review && rows.get(item.review.id)
      if (row) patch(item.key, { review: row })
    }
  }

  async function send(batch: IntakeItem[]) {
    if (submitting.value) return
    submitting.value = true
    try {
      for (const item of batch) {
        if (item.volume) await upload(item, item.volume.id)
      }
    } finally {
      submitting.value = false
    }
    resume()
  }

  function release(key: string) {
    const item = items.value.find(entry => entry.key === key)
    if (!item?.volume) return
    patch(key, {
      verdict: 'unknown',
      volume: null,
      suggestion: { ...item.volume, has_epub: false },
    })
  }

  return {
    items,
    plan,
    reading,
    submitting,
    add,
    release,
    submit: () => send([...plan.value.queue]),
    retry: (key: string) => send(items.value.filter(item => item.key === key)),
    remove: (key: string) => {
      items.value = items.value.filter(item => item.key !== key)
    },
    clear: () => {
      pause()
      items.value = []
    },
    pick: (key: string, volume: IntakeVolume) =>
      patch(key, { verdict: 'missing', volume, suggestion: null, error: null }),
  }
}
