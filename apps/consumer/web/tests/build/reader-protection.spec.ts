import { webcrypto } from 'node:crypto'
import { isAbsolute, resolve } from 'node:path'
import { build } from 'vite'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readerProtection } from '../../build/reader-protection'
import {
  decodeFileKey,
  encryptFile,
} from '../../../../../services/api/src/modules/reader/utils/file-crypto'

describe('reader production protection', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('runs the production crypto output without exposing source or protocol strings', async () => {
    vi.stubGlobal('crypto', webcrypto)
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [readerProtection()],
      build: {
        write: false,
        sourcemap: true,
        minify: true,
        rolldownOptions: {
          input: resolve('app/utils/media/file-crypto.ts'),
          preserveEntrySignatures: 'strict',
          output: { format: 'es' },
        },
      },
    })
    const outputs = (Array.isArray(result) ? result : [result]).flatMap(item =>
      'output' in item ? item.output : [],
    )
    expect(outputs.some(item => item.fileName.endsWith('.map'))).toBe(false)
    const chunk = outputs.find(item => item.type === 'chunk')!
    if (chunk.type !== 'chunk') throw new Error('Missing client output')
    expect(chunk.code).not.toContain('AES-GCM')
    expect(chunk.code).not.toContain('encodedKey')
    expect(chunk.code).not.toContain('sourceMappingURL')
    expect(chunk.code).not.toContain('app/utils/media/file-crypto')
    const runtime = await import(
      `data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`
    )
    const payload = runtime.createFileKey()
    const encrypted = Uint8Array.from(
      encryptFile('test', decodeFileKey(payload), Buffer.from('file')),
    ).buffer
    expect(new TextDecoder().decode(await runtime.decryptFile('test', payload, encrypted))).toBe(
      'file',
    )
    await expect(runtime.decryptFile('other', payload, encrypted)).rejects.toThrow()
  })

  it('leaves development, SSR and unrelated modules alone', async () => {
    const plugin = readerProtection()
    expect(plugin.apply).toBe('build')
    const transform = plugin.transform as (
      code: string,
      id: string,
      options?: { ssr: boolean },
    ) => unknown
    const code = 'export const value = "AES-GCM"'
    expect(await transform(code, '/app/utils/media/file-crypto.ts', { ssr: true })).toBeUndefined()
    expect(await transform(code, '/app/features/auth/login.ts')).toBeUndefined()
    expect(await transform(code, '/node_modules/vue/dist/vue.js')).toBeUndefined()
  })

  it('builds every transfer workflow with its endpoint strings obscured', async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [readerProtection()],
      build: {
        write: false,
        rolldownOptions: {
          input: [
            'app/components/hikari-reader/lib/session.ts',
            'app/components/manga/reader/composables/usePageLoader.ts',
            'app/features/manga/useMangaDownload.ts',
            'app/features/light-novel-volume/useNovelDownload.ts',
            'app/features/download/useDownloadQueue.ts',
            'app/utils/api/binary.ts',
          ].map(path => resolve(path)),
          external: id => !isAbsolute(id),
          preserveEntrySignatures: 'strict',
        },
      },
    })
    const outputs = (Array.isArray(result) ? result : [result]).flatMap(item =>
      'output' in item ? item.output : [],
    )
    const chunks = outputs.filter(item => item.type === 'chunk')
    expect(chunks.length).toBeGreaterThanOrEqual(6)
    for (const chunk of chunks) {
      expect(chunk.code).not.toContain('/api/v3/reader/')
      expect(chunk.code).not.toContain('/api/v3/user/me/')
      expect(chunk.code).not.toContain('encryption_key')
      expect(chunk.code).not.toContain('sourceMappingURL')
    }
  })
})
