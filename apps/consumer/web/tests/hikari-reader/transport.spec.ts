import { randomBytes, webcrypto } from 'node:crypto'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createFileKey, decryptFile } from '../../app/utils/media/file-crypto'
import { loadReaderEpub } from '../../app/components/hikari-reader/lib/session'
import {
  decodeFileKey,
  encodeFileKey,
  encryptFile,
} from '../../../../../services/api/src/modules/reader/utils/file-crypto'

function encrypted(id: string, key: Buffer) {
  return Uint8Array.from(encryptFile(id, key, Buffer.from('epub 日本語'))).buffer
}

describe('reader encrypted transport', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', webcrypto)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('decrypts the backend AES-GCM envelope', async () => {
    const key = randomBytes(32)
    const result = await decryptFile('session', encodeFileKey(key), encrypted('session', key))
    expect(new TextDecoder().decode(result)).toBe('epub 日本語')
  })

  it('rejects tampering, other sessions, other keys and truncated content', async () => {
    const key = randomBytes(32)
    const bytes = encrypted('session', key)
    await expect(decryptFile('other', encodeFileKey(key), bytes)).rejects.toThrow('校验失败')
    await expect(decryptFile('session', createFileKey(), bytes)).rejects.toThrow('校验失败')
    new Uint8Array(bytes)[15] ^= 1
    await expect(decryptFile('session', encodeFileKey(key), bytes)).rejects.toThrow('校验失败')
    await expect(decryptFile('session', encodeFileKey(key), new ArrayBuffer(10))).rejects.toThrow(
      '不完整',
    )
  })

  it('loads through the authenticated request utility and hands the reader plaintext bytes', async () => {
    const key = randomBytes(32)
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        id: 'session',
        p: encodeFileKey(key),
      })
      .mockImplementationOnce((_, options) => options.decodeBinary(encrypted('session', key)))
    vi.stubGlobal('hikariRequest', request)
    const hooks = { onPhase: vi.fn(), onDownload: vi.fn() }
    expect(new TextDecoder().decode(await loadReaderEpub(12, hooks))).toBe('epub 日本語')
    expect(request).toHaveBeenNthCalledWith(2, '/api/v3/reader/sessions/{id}/content', {
      method: 'GET',
      path: { id: 'session' },
      responseType: 'arrayBuffer',
      onDownload: hooks.onDownload,
      decodeBinary: expect.any(Function),
    })
    expect(hooks.onPhase.mock.calls.flat()).toEqual(['session', 'download'])
  })

  it('accepts browser payloads on the server and randomizes repeated key payloads', async () => {
    const payload = createFileKey()
    const key = decodeFileKey(payload)
    expect(key).toHaveLength(32)
    expect(decodeFileKey(encodeFileKey(key))).toEqual(key)
    expect(encodeFileKey(key)).not.toBe(encodeFileKey(key))
    const result = await decryptFile('file', payload, encrypted('file', key))
    expect(new TextDecoder().decode(result)).toBe('epub 日本語')
    await expect(
      decryptFile('file', key.toString('base64'), encrypted('file', key)),
    ).rejects.toThrow()
  })
})
