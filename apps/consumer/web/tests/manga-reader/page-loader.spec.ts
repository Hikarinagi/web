import { webcrypto } from 'node:crypto'
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePageLoader } from '../../app/components/manga/reader/composables/usePageLoader'
import { hikariRequest } from '../../app/utils/api/hikari-request'
import * as apiErrors from '../../app/utils/api/error'
import {
  decodeFileKey,
  encryptFile,
} from '../../../../../services/api/src/modules/reader/utils/file-crypto'

describe('encrypted manga page loading', () => {
  const request = vi.fn()
  const decode = vi.fn()
  const chapter = ref(2)
  const mime = ref<string | null>('image/webp')
  let scope: EffectScope
  let loader: ReturnType<typeof usePageLoader>

  beforeEach(() => {
    chapter.value = 2
    mime.value = 'image/webp'
    vi.useFakeTimers()
    vi.stubGlobal('crypto', webcrypto)
    decode.mockReset().mockResolvedValue(undefined)
    vi.stubGlobal(
      'Image',
      class {
        src = ''
        decoding = ''
        decode = decode
      },
    )
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:${Math.random()}`)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    request.mockReset().mockImplementation(async (_, options) => {
      const { manga_id, chapter_id, id } = options.path
      return options.decodeBinary(
        Uint8Array.from(
          encryptFile(
            `manga:page:${manga_id}:${chapter_id}:${id}`,
            decodeFileKey(options.body.p),
            Buffer.from('image'),
          ),
        ).buffer,
      )
    })
    vi.stubGlobal('hikariRequest', request)
    scope = effectScope()
    loader = scope.run(() =>
      usePageLoader({
        manga: () => 1,
        chapter: () => chapter.value,
        pages: () => [{ id: 7, page_number: 1, width: 800, height: 1200, mime_type: mime.value }],
      }),
    )!
  })

  afterEach(() => {
    scope.stop()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('requests by page ID and creates an image only from decrypted bytes', async () => {
    await loader.retry(1)
    expect(loader.statusOf(1)).toBe('ready')
    expect(loader.imageOf(1)?.src).toMatch(/^blob:/)
    expect(request).toHaveBeenCalledWith(
      '/api/v3/reader/mangas/{manga_id}/chapters/{chapter_id}/pages/{id}/content',
      expect.objectContaining({ path: { manga_id: 1, chapter_id: 2, id: 7 }, method: 'POST' }),
    )
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    expect(blob.type).toBe('image/webp')
    expect(await blob.text()).toBe('image')
    loader.ensureAround([1])
    expect(request).toHaveBeenCalledTimes(1)
    scope.stop()
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
  })

  it('discards old chapter responses and aborts their requests', async () => {
    let finish!: (value: ArrayBuffer) => void
    request.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = resolve
        }),
    )
    const loading = loader.retry(1)
    const signal = request.mock.calls[0][1].signal
    chapter.value = 3
    await nextTick()
    expect(signal.aborted).toBe(true)
    finish(new ArrayBuffer(3))
    await loading
    expect(loader.statusOf(1)).toBe('idle')
    expect(URL.createObjectURL).not.toHaveBeenCalled()
    await loader.retry(1)
    expect(loader.statusOf(1)).toBe('ready')
  })

  it('allows the browser to detect the image format when MIME metadata is missing', async () => {
    mime.value = null
    await loader.retry(1)
    expect(loader.statusOf(1)).toBe('ready')
    expect((vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob).type).toBe('')
  })

  it('revokes a pending decoded image after leaving and does not publish it', async () => {
    let finish!: () => void
    decode.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          finish = resolve
        }),
    )
    const loading = loader.retry(1)
    await vi.waitFor(() => expect(decode).toHaveBeenCalled())
    scope.stop()
    finish()
    await loading
    expect(loader.imageOf(1)).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
  })

  it('does not create an image from corrupt data and clears retry timers on disposal', async () => {
    request.mockImplementation((_, options) => options.decodeBinary(new ArrayBuffer(30)))
    await loader.retry(1)
    expect(URL.createObjectURL).not.toHaveBeenCalled()
    expect(loader.imageOf(1)).toBeNull()
    scope.stop()
    await vi.runAllTimersAsync()
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('keeps failed preloads and retries in the page error state without global notifications', async () => {
    const notify = vi.spyOn(apiErrors, 'showApiErrorToast').mockImplementation(() => {})
    const raw = vi.fn().mockRejectedValue(new Error('connection lost'))
    vi.stubGlobal('useNuxtApp', () => ({ $hikariFetch: { raw } }))
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: '/api/v3' } }))
    vi.stubGlobal('hikariRequest', hikariRequest)
    loader.ensureAround([1])
    await vi.advanceTimersByTimeAsync(900)
    expect(raw).toHaveBeenCalledTimes(2)
    expect(loader.statusOf(1)).toBe('error')
    expect(notify).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(900)
    expect(raw).toHaveBeenCalledTimes(2)
    vi.stubGlobal('hikariRequest', request)
    await loader.retry(1)
    expect(loader.statusOf(1)).toBe('ready')
  })
})
