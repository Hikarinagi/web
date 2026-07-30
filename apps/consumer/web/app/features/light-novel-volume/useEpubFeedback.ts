import { push } from 'notivue'
import { isTerminalStatus, type EpubReview } from './epub-correction'
import { toEpubReportBody, type EpubReportReason } from './epub-report'

const POLL_INTERVAL_MS = 2500

let epubLimitPromise: Promise<number | null> | null = null
function getEpubLimit(): Promise<number | null> {
  epubLimitPromise ??= hikariRequest('/api/v3/light-novel-volumes/epub/limits', {
    method: 'get',
    toast: false,
  })
    .then(r => r.max_epub_bytes)
    .catch((): number | null => {
      epubLimitPromise = null
      return null
    })
  return epubLimitPromise
}

async function validateEpub(picked: File): Promise<boolean> {
  const max = await getEpubLimit()
  if (max && picked.size > max) {
    push.error({ message: `EPUB 不能超过 ${Math.floor(max / 1024 / 1024)} MB` })
    return false
  }
  return true
}

export function useEpubFeedback(volumeId: number) {
  const {
    files,
    open: pickFile,
    reset: resetPicker,
  } = useFileDialog({
    accept: '.epub,application/epub+zip',
    multiple: false,
    reset: true,
  })
  const file = computed(() => files.value?.item(0) ?? null)

  const submitting = ref(false)
  const review = ref<EpubReview | null>(null)
  const status = computed(() => review.value?.status ?? null)
  const isTerminal = computed(() => isTerminalStatus(status.value))

  const { pause, resume } = useIntervalFn(poll, POLL_INTERVAL_MS, { immediate: false })

  async function poll() {
    const current = review.value
    if (!current) return
    try {
      const next = await hikariRequest(
        '/api/v3/light-novel-volumes/{id}/epub/corrections/{reviewId}',
        { method: 'get', path: { id: volumeId, reviewId: current.id }, toast: false },
      )
      if (review.value?.id !== current.id) return
      review.value = next
      if (isTerminalStatus(next.status)) pause()
    } catch {
      // 轮询期间的瞬时失败保持轮询,持续失败由后端终态兜底
    }
  }

  async function upload(picked: File) {
    const body = new FormData()
    body.append('file', picked)
    review.value = await hikariRequest('/api/v3/light-novel-volumes/{id}/epub/correction', {
      method: 'post',
      path: { id: volumeId },
      body,
    })
    if (!isTerminalStatus(review.value.status)) resume()
  }

  // epub 已存在:报告问题(幂等),可选附上修正文件
  async function submit(values: {
    reason: EpubReportReason
    description?: string
  }): Promise<'reviewing' | 'reported' | null> {
    const picked = file.value
    if (picked && !(await validateEpub(picked))) return null
    submitting.value = true
    try {
      await hikariRequest<'/api/v3/light-novel-volumes/{id}/epub/report', 'post'>(
        '/api/v3/light-novel-volumes/{id}/epub/report',
        { method: 'post', path: { id: volumeId }, body: toEpubReportBody(values) },
      )
      if (!picked) return 'reported'
      await upload(picked)
      return 'reviewing'
    } finally {
      submitting.value = false
    }
  }

  // epub 缺失:纯上传补全
  async function contribute() {
    const picked = file.value
    if (!picked || submitting.value) return
    if (!(await validateEpub(picked))) return
    submitting.value = true
    try {
      await upload(picked)
    } catch {
      // hikariRequest 已弹出错误(如 422 文件不合法),停留在选择态
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    pause()
    resetPicker()
    review.value = null
    submitting.value = false
  }

  return {
    file,
    pickFile,
    submitting,
    review,
    status,
    isTerminal,
    submit,
    contribute,
    reset,
    pause,
  }
}
