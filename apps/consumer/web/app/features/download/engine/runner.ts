import { crc32 } from './crc32'
import { EntryError, fetchEntry } from './fetcher'
import { fileSink, portSink, type Sink } from './sinks'
import { deleteRun, loadRun, saveRun } from './state'
import type {
  DownloadFailure,
  FileProgress,
  FileRunState,
  ManifestFile,
  RunRecord,
  StartCommand,
  WorkerEvent,
} from './types'
import { entryBlock, zipLayout, zipTail, type ZipLayout } from './zip'

export interface RunnerIo {
  post(event: WorkerEvent, transfer?: Transferable[]): void
  openPort(file: ManifestFile): Promise<void>
  sendChunk(file: number, seq: number, data: ArrayBuffer): Promise<void>
  closePort(file: number): void
  abortPort(file: number): void
}

interface EntrySlot {
  offset: number
  blockSize: number
}

const PROGRESS_INTERVAL_MS = 250
const SPEED_WINDOW_MS = 5000
const PERSIST_INTERVAL_MS = 1000

function safeName(name: string) {
  return name.replace(/[\\/:*?"<>|\p{Cc}]/gu, '_')
}

export class TaskRunner {
  private readonly abort = new AbortController()
  private readonly files: FileProgress[]
  private readonly samples: { at: number; bytes: number }[] = []
  private record: RunRecord | null = null
  private paused = false
  private written = 0
  private lastPost = 0
  private lastPersist = 0
  private currentFile: number | null = null

  constructor(
    private readonly command: StartCommand,
    private readonly io: RunnerIo,
  ) {
    this.files = command.manifest.files.map(file => ({
      index: file.index,
      name: file.name,
      bytes: file.bytes,
      written: 0,
      state: 'waiting',
    }))
  }

  get taskId() {
    return this.command.taskId
  }

  pause() {
    this.paused = true
    this.abort.abort(new DOMException('paused', 'AbortError'))
  }

  cancel() {
    this.abort.abort(new DOMException('cancelled', 'AbortError'))
  }

  async run() {
    const { taskId, manifest, sink, directory, title } = this.command
    try {
      if (sink === 'fs') {
        this.record = (await loadRun(taskId)) ?? {
          taskId,
          title,
          directory,
          files: {},
          updatedAt: Date.now(),
        }
        if (directory) this.record.directory = directory
      }
      for (const file of manifest.files) {
        this.currentFile = file.index
        await this.runFile(file)
      }
      this.currentFile = null
      await deleteRun(taskId)
      this.postProgress(true)
      this.io.post({ type: 'done', taskId })
    } catch (error) {
      if (this.abort.signal.aborted) {
        if (this.paused) {
          await this.persist(true)
          this.postProgress(true)
          this.io.post({ type: 'paused', taskId })
        } else {
          await deleteRun(taskId)
        }
        return
      }
      await this.persist(true)
      this.postProgress(true)
      this.io.post({ type: 'error', taskId, failure: this.failure(error) })
    }
  }

  private failure(error: unknown): DownloadFailure {
    if (error instanceof EntryError) {
      return { code: error.code, message: error.message, file: this.currentFile }
    }
    return {
      code: 'DOWNLOAD_FAILED',
      message: error instanceof Error ? error.message : String(error),
      file: this.currentFile,
    }
  }

  private async runFile(file: ManifestFile) {
    const progress = this.files[file.index]!
    const saved = this.record?.files[file.index]
    if (saved?.complete) {
      progress.written = file.bytes
      progress.state = 'done'
      this.written += file.bytes
      return
    }
    progress.state = 'saving'
    const zip = file.container === 'zip'
    const layout = zip
      ? zipLayout(file.entries.map(entry => ({ name: entry.name, size: entry.bytes })))
      : null
    const slots: EntrySlot[] = layout
      ? layout.entries.map(entry => ({ offset: entry.offset, blockSize: entry.blockSize }))
      : rawSlots(file)
    let state: FileRunState
    let sink: Sink
    if (this.command.sink === 'fs') {
      state = saved ?? { handle: null, done: [], crcs: {}, complete: false }
      const handle =
        state.handle ??
        (await this.command.directory!.getFileHandle(safeName(file.name), { create: true }))
      state.handle = handle
      this.record!.files[file.index] = state
      const resuming = state.done.length > 0
      sink = await fileSink(handle, resuming)
      if (!resuming) await this.persist(true)
    } else {
      state = { handle: null, done: [], crcs: {}, complete: false }
      await this.io.openPort(file)
      let seq = 0
      sink = portSink({
        send: data => this.io.sendChunk(file.index, seq++, data),
        close: async () => this.io.closePort(file.index),
        abort: async () => this.io.abortPort(file.index),
      })
    }
    const done = new Set(state.done)
    for (const index of done) {
      progress.written += slots[index]!.blockSize
      this.written += slots[index]!.blockSize
    }
    try {
      await this.writeEntries(file, layout, slots, sink, state, done)
      if (layout) {
        const crcs = layout.entries.map(entry => state.crcs[entry.index] ?? 0)
        const tail = zipTail(layout, crcs, this.command.stamp)
        await sink.write(layout.centralOffset, tail)
        this.advance(progress, tail.byteLength)
      }
      await sink.close()
      state.complete = true
      progress.state = 'done'
      await this.persist(true)
    } catch (error) {
      await sink.abort()
      if (this.command.sink !== 'fs') {
        progress.written = 0
        progress.state = 'waiting'
      } else if (!this.abort.signal.aborted) {
        progress.state = 'error'
      }
      throw error
    }
  }

  private async writeEntries(
    file: ManifestFile,
    layout: ZipLayout | null,
    slots: EntrySlot[],
    sink: Sink,
    state: FileRunState,
    done: Set<number>,
  ) {
    const { manifest } = this.command
    const signal = this.abort.signal
    const parallel = Math.max(1, manifest.parallel_connections)
    const pending = file.entries.map((_, index) => index).filter(index => !done.has(index))
    if (sink.sequential) {
      const results = new Map<number, Promise<Uint8Array>>()
      let cursor = 0
      const schedule = () => {
        while (results.size < parallel && cursor < pending.length) {
          const index = pending[cursor++]!
          results.set(index, fetchEntry(manifest, file, file.entries[index]!, signal))
        }
      }
      schedule()
      for (const index of pending) {
        const data = await results.get(index)!
        results.delete(index)
        await this.commit(file, layout, slots, sink, state, index, data)
        schedule()
      }
      return
    }
    let cursor = 0
    const lane = async () => {
      while (cursor < pending.length) {
        signal.throwIfAborted()
        const index = pending[cursor++]!
        const data = await fetchEntry(manifest, file, file.entries[index]!, signal)
        await this.commit(file, layout, slots, sink, state, index, data)
      }
    }
    await Promise.all(Array.from({ length: Math.min(parallel, pending.length) }, lane))
  }

  private async commit(
    file: ManifestFile,
    layout: ZipLayout | null,
    slots: EntrySlot[],
    sink: Sink,
    state: FileRunState,
    index: number,
    data: Uint8Array,
  ) {
    const slot = slots[index]!
    let block = data
    let crc = 0
    if (layout) {
      crc = crc32(data)
      block = entryBlock(layout.entries[index]!, data, crc, this.command.stamp)
    }
    await sink.write(slot.offset, block)
    state.done.push(index)
    state.crcs[index] = crc
    this.advance(this.files[file.index]!, block.byteLength)
    await this.persist(false)
  }

  private advance(progress: FileProgress, bytes: number) {
    progress.written += bytes
    this.written += bytes
    const now = Date.now()
    this.samples.push({ at: now, bytes })
    while (this.samples.length && this.samples[0]!.at < now - SPEED_WINDOW_MS) this.samples.shift()
    this.postProgress(false)
  }

  private postProgress(force: boolean) {
    const now = Date.now()
    if (!force && now - this.lastPost < PROGRESS_INTERVAL_MS) return
    this.lastPost = now
    const oldest = this.samples[0]?.at ?? now
    const elapsed = Math.max(1000, now - oldest)
    const recent = this.samples.reduce((sum, sample) => sum + sample.bytes, 0)
    this.io.post({
      type: 'progress',
      taskId: this.command.taskId,
      files: this.files.map(file => ({ ...file })),
      written: this.written,
      speed: Math.round((recent * 1000) / elapsed),
    })
  }

  private async persist(force: boolean) {
    if (!this.record) return
    const now = Date.now()
    if (!force && now - this.lastPersist < PERSIST_INTERVAL_MS) return
    this.lastPersist = now
    await saveRun(this.record)
  }
}

function rawSlots(file: ManifestFile): EntrySlot[] {
  let offset = 0
  return file.entries.map(entry => {
    const slot = { offset, blockSize: entry.bytes }
    offset += entry.bytes
    return slot
  })
}
