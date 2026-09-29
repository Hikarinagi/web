import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { useNovelDownload } from '../../../app/features/light-novel-volume/useNovelDownload'
import { usePurchaseDialog } from '../../../app/features/purchase/usePurchaseDialog'
import {
  decodeFileKey,
  encryptFile,
} from '../../../../../../services/api/src/modules/reader/utils/file-crypto'

describe('novel series download workflow', () => {
  const request = vi.fn()
  const purchase = usePurchaseDialog()
  const id = ref(12)
  const cards = {
    available: 3,
    purchased: 3,
    price: 6,
    points: 82,
    novel_count: 0,
    manga_count: 0,
    cards_used: 0,
    novel_band_size: 3,
    manga_band_size: 30,
  }
  const parts = [12, 13].map((id, index) => ({
    id,
    file_name: `小说 - 第 ${index + 1} 卷.epub`,
    revision: 'a'.repeat(64),
    required_cards: index === 0 ? 1 : 0,
  }))
  let scope: EffectScope
  let flow: ReturnType<typeof useNovelDownload>

  beforeEach(() => {
    vi.stubGlobal('crypto', webcrypto)
    id.value = 12
    request.mockReset().mockImplementation((url, options) => {
      if (url.endsWith('/volumes/{id}') && options.method !== 'POST')
        return Promise.resolve({
          ...cards,
          unlocked: false,
          series_id: 9,
          file_name: parts[0].file_name,
          revision: parts[0].revision,
          required_cards: 1,
        })
      if (url.endsWith('/series/{id}'))
        return Promise.resolve({
          ...cards,
          volumes: parts.map(part => ({ id: part.id, label: part.file_name })),
        })
      if (url.endsWith('/plan')) {
        const selected = parts.filter(part => options.body.volume_ids.includes(part.id))
        return Promise.resolve({
          ...cards,
          parts: selected,
          required_cards: selected.reduce((sum, part) => sum + part.required_cards, 0),
        })
      }
      return options.decodeBinary(
        Uint8Array.from(
          encryptFile(
            `novel:download:${options.path.id}:${options.body.revision ?? ''}`,
            decodeFileKey(options.body.p),
            Buffer.from('epub'),
          ),
        ).buffer,
      )
    })
    vi.stubGlobal('hikariRequest', request)
    vi.useFakeTimers()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:novel')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    scope = effectScope()
    flow = scope.run(() => useNovelDownload(() => id.value))!
  })

  afterEach(() => {
    scope.stop()
    purchase.cancel()
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('opens the same series picker from a volume with that volume selected', async () => {
    await flow.prepare()
    await nextTick()
    expect(flow.open.value).toBe(true)
    expect(flow.selected.value).toEqual([12])
    expect(flow.volumes.value).toHaveLength(2)
    expect(flow.quote.value?.required_cards).toBe(1)
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled()
  })

  it.each([false, true])(
    'keeps the selection and volume list on reopen (series: %s)',
    async series => {
      scope.stop()
      scope = effectScope()
      id.value = series ? 9 : 12
      flow = scope.run(() => useNovelDownload(() => id.value, series))!
      await flow.prepare()
      await nextTick()
      flow.selected.value = [13]
      await nextTick()
      const volumes = flow.volumes.value
      const quote = flow.quote.value
      flow.open.value = false
      await nextTick()
      expect(flow.quote.value).toBe(quote)
      expect(flow.selected.value).toEqual([13])
      const requests = request.mock.calls.length
      await flow.prepare()
      await nextTick()
      expect(flow.selected.value).toEqual([13])
      expect(flow.volumes.value).toBe(volumes)
      expect(request.mock.calls.slice(requests).map(([url]) => url)).toEqual([
        '/api/v3/user/me/novel/download/series/{id}/plan',
      ])
    },
  )

  it('selects the series and downloads every chosen volume with its own filename and budget', async () => {
    scope.stop()
    scope = effectScope()
    id.value = 9
    flow = scope.run(() => useNovelDownload(() => id.value, true))!
    await flow.prepare()
    await nextTick()
    expect(flow.selected.value).toEqual([12, 13])
    await flow.download()
    const files = request.mock.calls.filter(
      ([url, options]) => url.endsWith('/volumes/{id}') && options.method === 'POST',
    )
    expect(files.map(([, options]) => [options.path.id, options.body.max_cards])).toEqual([
      [12, 1],
      [13, 0],
    ])
    expect(new Set(files.map(([, options]) => options.body.p)).size).toBe(2)
    expect(vi.mocked(URL.createObjectURL).mock.calls.map(([blob]) => (blob as Blob).size)).toEqual([
      4, 4,
    ])
    expect(
      vi.mocked(HTMLAnchorElement.prototype.click).mock.contexts.map(link => link.download),
    ).toEqual(parts.map(part => part.file_name))
    expect(flow.open.value).toBe(false)
  })

  it('downloads a repeated volume without opening a dialog or authorizing any cards', async () => {
    request.mockResolvedValueOnce({
      ...cards,
      unlocked: true,
      series_id: 9,
      file_name: parts[0].file_name,
      revision: parts[0].revision,
      required_cards: 0,
    })
    await flow.prepare()
    expect(flow.open.value).toBe(false)
    expect(purchase.state.open).toBe(false)
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[1][1].body).toEqual({
      max_cards: 0,
      revision: parts[0].revision,
      p: expect.any(String),
    })
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1)
  })

  it('still downloads an unlocked volume directly after completing its first download', async () => {
    await flow.prepare()
    await nextTick()
    await flow.download()
    request.mockResolvedValueOnce({
      ...cards,
      unlocked: true,
      series_id: 9,
      file_name: parts[0].file_name,
      revision: parts[0].revision,
      required_cards: 0,
    })
    await flow.prepare()
    expect(flow.open.value).toBe(false)
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(2)
    expect(request.mock.lastCall?.[1].body.max_cards).toBe(0)
  })

  it('does not reopen an old volume after navigation', async () => {
    let resolve!: (value: unknown) => void
    request.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        }),
    )
    const preparing = flow.prepare()
    id.value = 20
    await nextTick()
    resolve({ ...cards, unlocked: false, series_id: 9 })
    await preparing
    expect(flow.open.value).toBe(false)
    expect(request).toHaveBeenCalledTimes(1)
  })
})
