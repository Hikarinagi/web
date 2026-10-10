const LOCAL_HEADER = 30
const CENTRAL_HEADER = 46
const EOCD = 22
const EOCD64 = 56
const EOCD64_LOCATOR = 20
const ZIP64_LOCAL_EXTRA = 20
const DESCRIPTOR = 16
const DESCRIPTOR64 = 24
const LIMIT32 = 0xffffffff
const LIMIT16 = 0xffff
const FLAGS = 0x0808
const VERSION = 20
const VERSION64 = 45

export interface ZipEntryInput {
  name: string
  size: number
}

export interface ZipEntryLayout {
  index: number
  name: Uint8Array
  size: number
  offset: number
  dataOffset: number
  blockSize: number
  zip64: boolean
}

export interface ZipLayout {
  entries: ZipEntryLayout[]
  centralOffset: number
  centralSize: number
  totalSize: number
  zip64: boolean
}

export interface ZipStamp {
  time: number
  date: number
}

const encoder = new TextEncoder()

export function dosStamp(date: Date): ZipStamp {
  const year = Math.max(1980, date.getFullYear())
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

export function zipLayout(inputs: ZipEntryInput[]): ZipLayout {
  const entries: ZipEntryLayout[] = []
  let offset = 0
  for (const [index, input] of inputs.entries()) {
    const name = encoder.encode(input.name)
    const zip64 = input.size >= LIMIT32 || offset >= LIMIT32
    const header = LOCAL_HEADER + name.length + (zip64 ? ZIP64_LOCAL_EXTRA : 0)
    const blockSize = header + input.size + (zip64 ? DESCRIPTOR64 : DESCRIPTOR)
    entries.push({
      index,
      name,
      size: input.size,
      offset,
      dataOffset: offset + header,
      blockSize,
      zip64,
    })
    offset += blockSize
  }
  const centralOffset = offset
  let centralSize = 0
  for (const entry of entries) {
    centralSize += CENTRAL_HEADER + entry.name.length + centralExtraSize(entry)
  }
  const zip64 =
    entries.some(entry => entry.zip64) ||
    centralOffset >= LIMIT32 ||
    centralSize >= LIMIT32 ||
    entries.length >= LIMIT16
  const totalSize = centralOffset + centralSize + (zip64 ? EOCD64 + EOCD64_LOCATOR : 0) + EOCD
  return { entries, centralOffset, centralSize, totalSize, zip64 }
}

function centralExtraSize(entry: ZipEntryLayout) {
  let fields = 0
  if (entry.size >= LIMIT32) fields += 2
  if (entry.offset >= LIMIT32) fields += 1
  return fields ? 4 + fields * 8 : 0
}

class Writer {
  readonly view: DataView
  readonly bytes: Uint8Array
  position = 0

  constructor(size: number) {
    this.bytes = new Uint8Array(size)
    this.view = new DataView(this.bytes.buffer)
  }

  u16(value: number) {
    this.view.setUint16(this.position, value, true)
    this.position += 2
  }

  u32(value: number) {
    this.view.setUint32(this.position, value >>> 0, true)
    this.position += 4
  }

  u64(value: number) {
    this.view.setBigUint64(this.position, BigInt(value), true)
    this.position += 8
  }

  raw(value: Uint8Array) {
    this.bytes.set(value, this.position)
    this.position += value.length
  }
}

export function entryBlock(
  entry: ZipEntryLayout,
  data: Uint8Array,
  crc: number,
  stamp: ZipStamp,
): Uint8Array {
  if (data.length !== entry.size) throw new Error('entry size mismatch')
  const writer = new Writer(entry.blockSize)
  writer.u32(0x04034b50)
  writer.u16(entry.zip64 ? VERSION64 : VERSION)
  writer.u16(FLAGS)
  writer.u16(0)
  writer.u16(stamp.time)
  writer.u16(stamp.date)
  writer.u32(0)
  writer.u32(entry.zip64 ? LIMIT32 : 0)
  writer.u32(entry.zip64 ? LIMIT32 : 0)
  writer.u16(entry.name.length)
  writer.u16(entry.zip64 ? ZIP64_LOCAL_EXTRA : 0)
  writer.raw(entry.name)
  if (entry.zip64) {
    writer.u16(0x0001)
    writer.u16(16)
    writer.u64(entry.size)
    writer.u64(entry.size)
  }
  writer.raw(data)
  writer.u32(0x08074b50)
  writer.u32(crc)
  if (entry.zip64) {
    writer.u64(entry.size)
    writer.u64(entry.size)
  } else {
    writer.u32(entry.size)
    writer.u32(entry.size)
  }
  return writer.bytes
}

export function zipTail(layout: ZipLayout, crcs: number[], stamp: ZipStamp): Uint8Array {
  const size = layout.totalSize - layout.centralOffset
  const writer = new Writer(size)
  for (const entry of layout.entries) {
    const extra = centralExtraSize(entry)
    writer.u32(0x02014b50)
    writer.u16((3 << 8) | (layout.zip64 ? VERSION64 : VERSION))
    writer.u16(entry.zip64 ? VERSION64 : VERSION)
    writer.u16(FLAGS)
    writer.u16(0)
    writer.u16(stamp.time)
    writer.u16(stamp.date)
    writer.u32(crcs[entry.index] ?? 0)
    writer.u32(entry.size >= LIMIT32 ? LIMIT32 : entry.size)
    writer.u32(entry.size >= LIMIT32 ? LIMIT32 : entry.size)
    writer.u16(entry.name.length)
    writer.u16(extra)
    writer.u16(0)
    writer.u16(0)
    writer.u16(0)
    writer.u32(0)
    writer.u32(entry.offset >= LIMIT32 ? LIMIT32 : entry.offset)
    writer.raw(entry.name)
    if (extra) {
      writer.u16(0x0001)
      writer.u16(extra - 4)
      if (entry.size >= LIMIT32) {
        writer.u64(entry.size)
        writer.u64(entry.size)
      }
      if (entry.offset >= LIMIT32) writer.u64(entry.offset)
    }
  }
  const count = layout.entries.length
  if (layout.zip64) {
    const eocd64 = layout.centralOffset + layout.centralSize
    writer.u32(0x06064b50)
    writer.u64(EOCD64 - 12)
    writer.u16((3 << 8) | VERSION64)
    writer.u16(VERSION64)
    writer.u32(0)
    writer.u32(0)
    writer.u64(count)
    writer.u64(count)
    writer.u64(layout.centralSize)
    writer.u64(layout.centralOffset)
    writer.u32(0x07064b50)
    writer.u32(0)
    writer.u64(eocd64)
    writer.u32(1)
  }
  writer.u32(0x06054b50)
  writer.u16(0)
  writer.u16(0)
  writer.u16(count >= LIMIT16 ? LIMIT16 : count)
  writer.u16(count >= LIMIT16 ? LIMIT16 : count)
  writer.u32(layout.centralSize >= LIMIT32 ? LIMIT32 : layout.centralSize)
  writer.u32(layout.centralOffset >= LIMIT32 ? LIMIT32 : layout.centralOffset)
  writer.u16(0)
  return writer.bytes
}
