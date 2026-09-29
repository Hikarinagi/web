import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { useMangaDownload } from '../../../app/features/manga/useMangaDownload'
import { usePurchaseDialog } from '../../../app/features/purchase/usePurchaseDialog'
import {
  decodeFileKey,
  encryptFile,
} from '../../../../../../services/api/src/modules/reader/utils/file-crypto'

describe('shared download queue through manga', () => {
  const request = vi.fn()
  const files = vi.fn()
  const plans = vi.fn()
  const purchase = usePurchaseDialog()
  const id = ref(3)
  const initial = {
    available: 1,
    purchased: 1,
    price: 6,
    points: 94,
    novel_count: 0,
    manga_count: 0,
    cards_used: 0,
    novel_band_size: 3,
    manga_band_size: 30,
  }
  const parts = [1, 2].map(index => ({
    page_ids: [index],
    revision: String(index).repeat(64),
    file_name: `漫画 - 第 ${index} 话.cbz`,
    byte_size: 1024,
    required_cards: index === 1 ? 1 : 0,
  }))
  let cards = { ...initial }
  let scope: EffectScope
  let flow: ReturnType<typeof useMangaDownload>

  beforeEach(() => {
    id.value = 3
    cards = { ...initial }
    files.mockReset().mockResolvedValue(new ArrayBuffer(4))
    plans
      .mockReset()
      .mockImplementation(() => Promise.resolve({ ...cards, parts, required_cards: 1 }))
    request.mockReset().mockImplementation((url, options) => {
      if (url.endsWith('/plan')) return plans(options)
      if (url.endsWith('/files'))
        return files(options).then((data: ArrayBuffer) =>
          options.decodeBinary(
            Uint8Array.from(
              encryptFile(
                `manga:download:${options.path.id}:${options.body.revision}`,
                decodeFileKey(options.body.p),
                Buffer.from(data),
              ),
            ).buffer,
          ),
        )
      if (url.endsWith('/cards')) {
        const quantity = options.body.quantity
        cards = {
          ...cards,
          available: cards.available + quantity,
          points: cards.points - quantity * cards.price,
        }
      }
      return Promise.resolve(cards)
    })
    vi.stubGlobal('hikariRequest', request)
    vi.stubGlobal('crypto', webcrypto)
    vi.useFakeTimers()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:comic')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    scope = effectScope()
    flow = scope.run(() => useMangaDownload(() => id.value))!
    flow.selected.value = [1, 2]
  })

  afterEach(() => {
    scope.stop()
    purchase.cancel()
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  async function prepare() {
    await flow.prepare()
    await nextTick()
  }

  it('quotes the selection before downloading and does not fetch any files on open', async () => {
    await prepare()
    expect(flow.quote.value?.required_cards).toBe(1)
    expect(flow.open.value).toBe(true)
    expect(files).not.toHaveBeenCalled()
    expect(purchase.state.open).toBe(false)
  })

  it('keeps loaded data when closed and revalidates on reopen without clearing it', async () => {
    await prepare()
    const quote = flow.quote.value
    const status = flow.status.value
    flow.open.value = false
    await nextTick()
    expect(flow.quote.value).toBe(quote)
    expect(flow.status.value).toBe(status)
    expect(flow.selected.value).toEqual([1, 2])
    expect(plans).toHaveBeenCalledTimes(1)

    let resolve!: (value: unknown) => void
    plans.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        }),
    )
    await flow.prepare()
    expect(flow.open.value).toBe(true)
    expect(flow.loading.value).toBe(false)
    expect(flow.quoting.value).toBe(true)
    expect(flow.quote.value).toBe(quote)
    expect(flow.status.value).toBe(status)
    expect(request.mock.calls.filter(([url]) => !url.endsWith('/plan'))).toHaveLength(1)
    await flow.download()
    expect(files).not.toHaveBeenCalled()

    resolve({ ...cards, available: 0, parts, required_cards: 2 })
    await nextTick()
    expect(flow.required.value).toBe(2)
    expect(flow.needsCard.value).toBe(true)
  })

  it('retains a quote that finishes after closing the dialog', async () => {
    let resolve!: (value: unknown) => void
    plans.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        }),
    )
    await prepare()
    const signal = plans.mock.calls[0][0].signal
    flow.open.value = false
    await nextTick()
    expect(signal.aborted).toBe(false)
    resolve({ ...cards, parts, required_cards: 1 })
    await nextTick()
    expect(flow.open.value).toBe(false)
    expect(flow.quote.value?.required_cards).toBe(1)
    expect(flow.quoting.value).toBe(false)
  })

  it('does not allow an old quote to authorize files when reopening fails to refresh', async () => {
    await prepare()
    flow.open.value = false
    plans.mockRejectedValueOnce(new Error('network'))
    await prepare()
    expect(flow.quote.value).toBeNull()
    await flow.download()
    expect(files).not.toHaveBeenCalled()
    await flow.refreshQuote()
    expect(flow.quote.value?.required_cards).toBe(1)
  })

  it('buys the missing quantity in the purchase dialog and preserves selection without starting files', async () => {
    plans.mockImplementation(() => Promise.resolve({ ...cards, parts, required_cards: 3 }))
    await prepare()
    await flow.download()
    expect(purchase.state.open).toBe(true)
    expect(purchase.state.quantity).toBe(2)
    expect(purchase.state.item?.price).toBe(6)
    expect(flow.open.value).toBe(true)
    await purchase.confirm(purchase.state.quantity)
    await nextTick()
    expect(request).toHaveBeenCalledWith('/api/v3/user/me/download/cards', {
      method: 'POST',
      body: { quantity: 2 },
    })
    expect(flow.status.value?.available).toBe(3)
    expect(flow.selected.value).toEqual([1, 2])
    expect(flow.open.value).toBe(true)
    expect(files).not.toHaveBeenCalled()
  })

  it('leaves selection intact when the purchase is cancelled and does not enforce the old monthly cap', async () => {
    cards = { ...cards, available: 0, purchased: 100 }
    await prepare()
    await flow.download()
    expect(purchase.state.open).toBe(true)
    purchase.cancel()
    await nextTick()
    expect(flow.open.value).toBe(true)
    expect(flow.selected.value).toEqual([1, 2])
    expect(files).not.toHaveBeenCalled()
  })

  it('sends per-file card ceilings and preserves ordered filenames', async () => {
    await prepare()
    await Promise.all([flow.download(), flow.download()])
    expect(files.mock.calls.map(([options]) => options.body.max_cards)).toEqual([1, 0])
    expect(
      vi.mocked(HTMLAnchorElement.prototype.click).mock.contexts.map(link => link.download),
    ).toEqual(parts.map(part => part.file_name))
    expect(flow.completed.value).toBe(2)
    expect(new Set(files.mock.calls.map(([options]) => options.body.p)).size).toBe(2)
    expect(vi.mocked(URL.createObjectURL).mock.calls.map(([blob]) => (blob as Blob).size)).toEqual([
      4, 4,
    ])
    expect(flow.open.value).toBe(false)
    vi.runOnlyPendingTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
  })

  it('refreshes the quote after failure and retries only unfinished files', async () => {
    files.mockResolvedValueOnce(new ArrayBuffer(4)).mockRejectedValueOnce(new Error('network'))
    await prepare()
    plans.mockImplementation(() =>
      Promise.resolve({
        ...cards,
        available: 0,
        parts: parts.map(part => ({ ...part, required_cards: 0 })),
        required_cards: 0,
      }),
    )
    await flow.download()
    expect(flow.completed.value).toBe(1)
    expect(flow.quote.value?.required_cards).toBe(0)
    await flow.download()
    expect(files.mock.calls.map(([options]) => options.body.page_ids)).toEqual([[1], [2], [2]])
    expect(flow.completed.value).toBe(2)
    expect(purchase.state.open).toBe(false)
  })

  it('resumes only unfinished files after closing and reopening a paused queue', async () => {
    files.mockResolvedValueOnce(new ArrayBuffer(4)).mockRejectedValueOnce(new Error('network'))
    await prepare()
    plans.mockImplementation(() =>
      Promise.resolve({
        ...cards,
        available: 0,
        parts: parts.map(part => ({ ...part, required_cards: 0 })),
        required_cards: 0,
      }),
    )
    await flow.download()
    flow.open.value = false
    await nextTick()
    expect(flow.completed.value).toBe(1)
    expect(flow.parts.value).toHaveLength(2)
    await prepare()
    expect(flow.completed.value).toBe(1)
    expect(flow.selected.value).toEqual([1, 2])
    await flow.download()
    expect(files.mock.calls.map(([options]) => options.body.page_ids)).toEqual([[1], [2], [2]])
    expect(purchase.state.open).toBe(false)
  })

  it('stops an active file while leaving the download queue available', async () => {
    files.mockImplementationOnce(
      options =>
        new Promise((_, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('Stopped', 'AbortError')),
          )
          queueMicrotask(() => flow.stop())
        }),
    )
    await prepare()
    await flow.download()
    expect(flow.open.value).toBe(true)
    expect(flow.parts.value).toHaveLength(2)
    expect(flow.completed.value).toBe(0)
    expect(flow.busy.value).toBe(false)
  })

  it('ignores stale quote responses after the selection changes', async () => {
    let resolve!: (value: unknown) => void
    plans.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        }),
    )
    await prepare()
    expect(flow.quoting.value).toBe(true)
    flow.selected.value = [2]
    await nextTick()
    resolve({ ...cards, parts, required_cards: 100 })
    await nextTick()
    expect(flow.quote.value?.required_cards).toBe(1)
    expect(flow.selected.value).toEqual([2])
  })

  it('discards cached data and stale quotes when navigating to another work', async () => {
    let resolve!: (value: unknown) => void
    plans.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        }),
    )
    await prepare()
    id.value = 4
    await nextTick()
    resolve({ ...cards, parts, required_cards: 1 })
    await nextTick()
    expect(flow.open.value).toBe(false)
    expect(flow.status.value).toBeNull()
    expect(flow.quote.value).toBeNull()
    expect(flow.quoting.value).toBe(false)
    await prepare()
    expect(request.mock.calls.filter(([url]) => !url.endsWith('/plan'))).toHaveLength(2)
  })

  it('returns to selection and requests confirmation if completed file versions changed', async () => {
    files.mockResolvedValueOnce(new ArrayBuffer(4)).mockRejectedValueOnce(new Error('changed'))
    await prepare()
    plans.mockImplementation(() =>
      Promise.resolve({
        ...cards,
        parts: parts.map(part => ({ ...part, revision: 'c'.repeat(64) })),
        required_cards: 3,
      }),
    )
    await flow.download()
    expect(flow.parts.value).toEqual([])
    expect(flow.quote.value?.required_cards).toBe(3)
    expect(files).toHaveBeenCalledTimes(2)
  })
})
