export interface Sink {
  readonly sequential: boolean
  write(offset: number, data: Uint8Array): Promise<void>
  close(): Promise<void>
  abort(): Promise<void>
}

export async function fileSink(
  handle: FileSystemFileHandle,
  keepExistingData: boolean,
): Promise<Sink> {
  const writable = await handle.createWritable({ keepExistingData })
  return {
    sequential: false,
    write: (offset, data) =>
      writable.write({ type: 'write', position: offset, data: data as BufferSource }),
    close: () => writable.close(),
    abort: () => writable.abort().catch(() => undefined),
  }
}

export function portSink(io: {
  send(data: ArrayBuffer): Promise<void>
  close(): Promise<void>
  abort(): Promise<void>
}): Sink {
  let written = 0
  return {
    sequential: true,
    async write(offset, data) {
      if (offset !== written) throw new Error('sequential sink received an out-of-order block')
      written += data.byteLength
      const copy = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      await io.send(copy as ArrayBuffer)
    },
    close: () => io.close(),
    abort: () => io.abort(),
  }
}
