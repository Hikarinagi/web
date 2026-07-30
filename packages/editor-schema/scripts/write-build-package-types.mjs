import { mkdir, writeFile } from 'node:fs/promises'

const packageTypes = [
  { dir: 'dist', type: 'module' },
  { dir: 'dist/esm', type: 'module' },
  { dir: 'dist/cjs', type: 'commonjs' },
]

await Promise.all(
  packageTypes.map(async ({ dir, type }) => {
    const distDir = new URL(`../${dir}/`, import.meta.url)
    await mkdir(distDir, { recursive: true })
    await writeFile(new URL('package.json', distDir), `${JSON.stringify({ type }, null, 2)}\n`)
  }),
)

await Promise.all([
  writeFile(new URL('../dist/index.js', import.meta.url), "export * from './esm/index.js'\n"),
  writeFile(new URL('../dist/index.d.ts', import.meta.url), "export * from './types/index.js'\n"),
])
