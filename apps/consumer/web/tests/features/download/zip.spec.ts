import { describe, expect, it } from 'vitest'
import { unzipSync } from 'fflate'
import { crc32 } from '~/features/download/engine/crc32'
import { dosStamp, entryBlock, zipLayout, zipTail } from '~/features/download/engine/zip'

const stamp = dosStamp(new Date(2026, 9, 3, 12, 30, 0))

function build(files: { name: string; data: Uint8Array }[]) {
  const layout = zipLayout(files.map(file => ({ name: file.name, size: file.data.length })))
  const output = new Uint8Array(layout.totalSize)
  const crcs: number[] = []
  for (const entry of layout.entries) {
    const data = files[entry.index]!.data
    const crc = crc32(data)
    crcs[entry.index] = crc
    output.set(entryBlock(entry, data, crc, stamp), entry.offset)
  }
  output.set(zipTail(layout, crcs, stamp), layout.centralOffset)
  return { layout, output }
}

describe('crc32', () => {
  it('matches the reference values', () => {
    expect(crc32(new TextEncoder().encode(''))).toBe(0)
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
    expect(crc32(new TextEncoder().encode('The quick brown fox jumps over the lazy dog'))).toBe(
      0x414fa339,
    )
  })

  it('can be continued across chunks', () => {
    const text = new TextEncoder().encode('123456789')
    const first = crc32(text.subarray(0, 4))
    expect(crc32(text.subarray(4), first)).toBe(crc32(text))
  })
})

describe('zip layout', () => {
  it('fixes every entry offset before any byte is written', () => {
    const layout = zipLayout([
      { name: '000001_第 1 话_0001.jpg', size: 10 },
      { name: '000002_第 1 话_0002.jpg', size: 20 },
    ])
    expect(layout.entries[0]!.offset).toBe(0)
    expect(layout.entries[1]!.offset).toBe(layout.entries[0]!.blockSize)
    expect(layout.entries[0]!.dataOffset).toBe(30 + layout.entries[0]!.name.length)
    expect(layout.centralOffset).toBe(layout.entries[0]!.blockSize + layout.entries[1]!.blockSize)
    expect(layout.zip64).toBe(false)
    expect(layout.totalSize).toBe(layout.centralOffset + layout.centralSize + 22)
  })

  it('switches to zip64 structures past 4 GiB', () => {
    const layout = zipLayout([
      { name: 'a.bin', size: 0x1_0000_0000 },
      { name: 'b.bin', size: 1 },
    ])
    expect(layout.entries[0]!.zip64).toBe(true)
    expect(layout.entries[1]!.zip64).toBe(true)
    expect(layout.zip64).toBe(true)
    expect(layout.totalSize).toBe(layout.centralOffset + layout.centralSize + 56 + 20 + 22)
  })
})

describe('stored zip output', () => {
  it('produces an archive that unzips back to the same files in order', () => {
    const files = [
      { name: '000001_第 1 话_0001.jpg', data: new TextEncoder().encode('first page') },
      { name: 'OEBPS/text/000002.xhtml', data: new TextEncoder().encode('<html/>') },
      { name: 'empty.bin', data: new Uint8Array(0) },
    ]
    const { layout, output } = build(files)
    expect(output.length).toBe(layout.totalSize)
    const unzipped = unzipSync(output)
    expect(Object.keys(unzipped)).toEqual(files.map(file => file.name))
    for (const file of files) expect(unzipped[file.name]).toEqual(file.data)
  })

  it('writes the data descriptor with the crc of the entry', () => {
    const data = new TextEncoder().encode('123456789')
    const layout = zipLayout([{ name: 'x', size: data.length }])
    const block = entryBlock(layout.entries[0]!, data, crc32(data), stamp)
    const view = new DataView(block.buffer)
    const descriptor = block.length - 16
    expect(view.getUint32(descriptor, true)).toBe(0x08074b50)
    expect(view.getUint32(descriptor + 4, true)).toBe(0xcbf43926)
    expect(view.getUint32(descriptor + 8, true)).toBe(9)
    expect(() => entryBlock(layout.entries[0]!, data.subarray(1), 0, stamp)).toThrow()
  })
})
