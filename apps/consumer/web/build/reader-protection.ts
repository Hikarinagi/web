import type { Plugin } from 'vite'

export function readerProtection(): Plugin {
  const protectedPaths = [
    '/app/components/hikari-reader/lib/',
    '/app/components/manga/reader/composables/',
    '/app/features/download/',
    '/app/features/light-novel-volume/useNovelDownload.ts',
    '/app/features/manga/useMangaDownload.ts',
    '/app/utils/media/file-crypto.ts',
    '/app/utils/api/binary.ts',
  ]
  return {
    name: 'hikari-reader-protection',
    apply: 'build',
    enforce: 'post',
    config: () => ({ build: { sourcemap: false } }),
    async transform(code, id, options) {
      if (options?.ssr) return
      const path = id.replace(/\\/g, '/').split('?')[0]!
      if (!path.endsWith('.ts') || !protectedPaths.some(part => path.includes(part))) return
      const { default: obfuscator } = await import('javascript-obfuscator')
      const result = obfuscator.obfuscate(code, {
        target: 'browser-no-eval',
        compact: true,
        sourceMap: false,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        renameProperties: false,
        transformObjectKeys: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        selfDefending: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1,
        stringArrayCallsTransform: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
      })
      return { code: result.getObfuscatedCode(), map: { mappings: '' } }
    },
  }
}
