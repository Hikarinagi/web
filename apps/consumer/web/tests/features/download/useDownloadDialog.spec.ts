import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { effectScope, ref, type EffectScope } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDownloadDialog } from '~/features/download/useDownloadDialog'
import { HikariApiError } from '~/utils/api/error'

const engine = vi.hoisted(() => ({
  runs: new Map([[5, { taskId: 5, title: '作品', state: 'error' }]]),
  preferredSink: () => 'memory',
  pickDirectory: vi.fn(),
  requestManifest: vi.fn(),
  start: vi.fn(),
  resume: vi.fn(),
  pause: vi.fn(),
}))
const toastFailure = vi.hoisted(() => vi.fn())
vi.mock('~/features/download/useDownloadEngine', () => ({
  toastFailure,
  useDownloadEngine: () => engine,
}))

const quote = {
  series_id: 9,
  required_cards: 0,
  cards: { available: 0 },
  blocked: null,
  files: [],
  limits: { memory_fallback_max_bytes: 1_000_000 },
}
const request = vi.fn()
let scope: EffectScope

async function ready() {
  scope = effectScope()
  const flow = scope.run(() =>
    useDownloadDialog({ kind: 'MANGA', seriesId: () => 9, format: ref('CBZ') }),
  )!
  flow.selected.value = [1]
  flow.open.value = true
  await flow.refreshQuote()
  return flow
}

const quotes = () => request.mock.calls.filter(([url]) => String(url).endsWith('/quotes')).length

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  request.mockReset()
  request.mockImplementation(async (url: string) => {
    if (url.endsWith('/quotes')) return quote
    return { id: 5, title: '作品', format: 'CBZ' }
  })
  vi.stubGlobal('hikariRequest', request)
  engine.requestManifest.mockReset().mockResolvedValue({ files: [] })
  engine.start.mockReset()
  engine.resume.mockReset()
  toastFailure.mockReset()
})

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useDownloadDialog save', () => {
  it('hands a failure that is not an API error to toastFailure', async () => {
    const flow = await ready()
    const error = new TypeError('Failed to construct Worker')
    engine.requestManifest.mockRejectedValue(error)
    const before = quotes()
    await flow.save()
    expect(toastFailure).toHaveBeenCalledWith(error)
    expect(quotes()).toBe(before)
    expect(flow.creating.value).toBe(false)
  })

  it('hands an API error to toastFailure as well and refreshes the quote', async () => {
    const flow = await ready()
    const error = new HikariApiError({
      status: 409,
      code: HIKARI_BIZ_CODE.DOWNLOAD_COST_CHANGED,
      message: '本次所需下载卡已变化，请确认后重试',
    })
    request.mockImplementation(async (url: string) => {
      if (url.endsWith('/quotes')) return quote
      throw error
    })
    const before = quotes()
    await flow.save()
    expect(toastFailure).toHaveBeenCalledWith(error)
    expect(quotes()).toBe(before + 1)
  })
})

describe('useDownloadDialog resume', () => {
  it('hands a failed resume to toastFailure instead of leaving the rejection unhandled', async () => {
    const flow = await ready()
    await flow.save()
    expect(flow.run.value).toMatchObject({ taskId: 5 })
    const error = new DOMException('folder access was not granted', 'NotAllowedError')
    engine.resume.mockRejectedValue(error)
    await expect(flow.resume()).resolves.toBeUndefined()
    expect(engine.resume).toHaveBeenCalledWith({ id: 5, title: '作品', format: 'CBZ' })
    expect(toastFailure).toHaveBeenCalledWith(error)
  })
})
