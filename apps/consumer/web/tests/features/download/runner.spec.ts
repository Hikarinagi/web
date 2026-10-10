import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { unzipSync } from 'fflate'
import type { RunRecord, StartCommand, WorkerEvent } from '~/features/download/engine/types'
import { TaskRunner, type RunnerIo } from '~/features/download/engine/runner'
import { zipLayout } from '~/features/download/engine/zip'

const records = new Map<number, RunRecord>()
vi.mock('~/features/download/engine/state', () => ({
  loadRun: vi.fn(async (taskId: number) => records.get(taskId) ?? null),
  saveRun: vi.fn(async (record: RunRecord) => {
    records.set(record.taskId, {
      ...record,
      directory: null,
      files: Object.fromEntries(
        Object.entries(record.files).map(([index, file]) => [
          index,
          { ...file, handle: null, done: [...file.done], crcs: { ...file.crcs } },
        ]),
      ),
    })
  }),
  deleteRun: vi.fn(async (taskId: number) => {
    records.delete(taskId)
  }),
  listRuns: vi.fn(async () => [...records.values()]),
}))

const pages = new Map<number, Uint8Array>()
const fetched: number[] = []
let failOn: number | null = null
let holdOn: number | null = null
let release: () => void = () => {}
const held = () =>
  new Promise<void>(resolve => {
    release = resolve
  })

vi.mock('~/features/download/engine/fetcher', async () => {
  const actual = await vi.importActual<typeof import('~/features/download/engine/fetcher')>(
    '~/features/download/engine/fetcher',
  )
  return {
    ...actual,
    fetchEntry: vi.fn(
      async (
        _manifest: unknown,
        _file: unknown,
        entry: { page_id: number | null },
        signal: AbortSignal,
      ) => {
        const id = entry.page_id!
        fetched.push(id)
        if (failOn === id) throw new actual.EntryError('HTTP_500', 'boom', false)
        if (holdOn === id) {
          await held()
          signal.throwIfAborted()
        }
        return pages.get(id)!
      },
    ),
  }
})

function fakeDirectory(store: Map<string, Uint8Array>) {
  const handles = new Map<string, FileSystemFileHandle>()
  return {
    name: 'downloads',
    getFileHandle: async (name: string) => {
      let handle = handles.get(name)
      if (handle) return handle
      handle = {
        name,
        createWritable: async ({ keepExistingData }: { keepExistingData: boolean }) => {
          let bytes = keepExistingData ? (store.get(name) ?? new Uint8Array()) : new Uint8Array()
          return {
            write: async (chunk: { position: number; data: Uint8Array }) => {
              const end = chunk.position + chunk.data.byteLength
              if (end > bytes.length) {
                const grown = new Uint8Array(end)
                grown.set(bytes)
                bytes = grown
              }
              bytes.set(chunk.data, chunk.position)
            },
            close: async () => {
              store.set(name, bytes)
            },
            abort: async () => {
              store.set(name, bytes)
            },
          }
        },
      } as unknown as FileSystemFileHandle
      handles.set(name, handle)
      return handle
    },
  } as unknown as FileSystemDirectoryHandle
}

function command(directory: FileSystemDirectoryHandle): StartCommand {
  const entries = [1, 2, 3, 4].map(id => ({
    kind: 'page' as const,
    name: `00000${id}_第 1 话_000${id}.jpg`,
    bytes: pages.get(id)!.byteLength,
    page_id: id,
    chapter_id: 7,
    mime_type: 'image/jpeg',
    data: null,
    index: null,
  }))
  const layout = zipLayout(entries.map(entry => ({ name: entry.name, size: entry.bytes })))
  return {
    type: 'start',
    taskId: 42,
    title: '漫画',
    sink: 'fs',
    directory,
    stamp: { time: 0, date: 0x21 },
    manifest: {
      task_id: 42,
      kind: 'MANGA',
      series_id: 9,
      format: 'CBZ',
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
      parallel_connections: 2,
      files: [
        { index: 0, name: '漫画 第 1 话.cbz', bytes: layout.totalSize, container: 'zip', entries },
      ],
    },
  }
}

function io(events: WorkerEvent[]): RunnerIo {
  return {
    post: event => void events.push(event),
    openPort: async () => {},
    sendChunk: async () => {},
    closePort: () => {},
    abortPort: () => {},
  }
}

describe('TaskRunner', () => {
  beforeEach(() => {
    records.clear()
    fetched.length = 0
    failOn = null
    holdOn = null
    pages.clear()
    for (const id of [1, 2, 3, 4]) pages.set(id, new TextEncoder().encode(`page-${id}-content`))
  })
  afterEach(() => vi.clearAllMocks())

  it('resumes from the persisted entry set and still writes a valid archive', async () => {
    const store = new Map<string, Uint8Array>()
    const directory = fakeDirectory(store)
    failOn = 3
    const first: WorkerEvent[] = []
    await new TaskRunner(command(directory), io(first)).run()
    expect(first.at(-1)).toMatchObject({ type: 'error', failure: { code: 'HTTP_500' } })
    const record = records.get(42)!
    expect(record.files[0]!.done.sort()).toEqual(expect.arrayContaining([0, 1]))
    expect(record.files[0]!.complete).toBe(false)
    const attempted = [...fetched]

    failOn = null
    fetched.length = 0
    const second: WorkerEvent[] = []
    await new TaskRunner(command(directory), io(second)).run()
    expect(second.at(-1)).toMatchObject({ type: 'done', taskId: 42 })
    expect(fetched).not.toContain(1)
    expect(fetched).not.toContain(2)
    expect(fetched.length).toBeLessThan(attempted.length + 4)
    expect(records.has(42)).toBe(false)

    const archive = store.get('漫画 第 1 话.cbz')!
    const unzipped = unzipSync(archive)
    expect(Object.keys(unzipped)).toHaveLength(4)
    for (const id of [1, 2, 3, 4]) {
      expect(unzipped[`00000${id}_第 1 话_000${id}.jpg`]).toEqual(pages.get(id))
    }
    const progress = second.filter(event => event.type === 'progress').at(-1)
    expect(progress).toMatchObject({ written: archive.byteLength })
  })

  it('pauses without losing written entries', async () => {
    const store = new Map<string, Uint8Array>()
    const directory = fakeDirectory(store)
    const events: WorkerEvent[] = []
    holdOn = 3
    const runner = new TaskRunner(command(directory), io(events))
    const running = runner.run()
    while (!fetched.includes(3)) await new Promise(resolve => setTimeout(resolve, 0))
    runner.pause()
    release()
    await running
    expect(events.at(-1)).toMatchObject({ type: 'paused', taskId: 42 })
    const file = records.get(42)?.files[0]
    expect(file?.complete).toBe(false)
    expect(file?.done).toEqual(expect.arrayContaining([0, 1]))
  })
})
