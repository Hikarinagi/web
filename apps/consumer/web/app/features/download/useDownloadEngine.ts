import { computed, reactive } from 'vue'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import {
  directorySupported,
  memoryOutlet,
  openStreamOutlet,
  streamSupported,
  type Outlet,
} from './engine/outlets'
import { deleteRun, listRuns, loadRun } from './engine/state'
import type {
  DownloadFailure,
  DownloadManifest,
  RunSnapshot,
  SinkKind,
  WorkerCommand,
  WorkerEvent,
} from './engine/types'
import { dosStamp } from './engine/zip'

export type DownloadTask = ApiData<'/api/v3/user/me/downloads/{id}', 'get'>

const runs = reactive(new Map<number, RunSnapshot>())
const interrupted = reactive(new Set<number>())
const outlets = new Map<string, Outlet>()
let worker: Worker | null = null
let restored = false

function mimeOf(format: DownloadTask['format']) {
  return format === 'EPUB' ? 'application/epub+zip' : 'application/vnd.comicbook+zip'
}

function key(taskId: number, file: number) {
  return `${taskId}:${file}`
}

function post(command: WorkerCommand) {
  if (!worker) {
    worker = new Worker(new URL('./engine/worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = event => void handle(event.data as WorkerEvent)
  }
  worker.postMessage(command)
}

function fail(run: RunSnapshot, failure: DownloadFailure) {
  run.state = 'error'
  run.error = failure
  run.speed = 0
}

async function handle(event: WorkerEvent) {
  const run = runs.get(event.taskId)
  if (!run) return
  switch (event.type) {
    case 'progress':
      run.files = event.files
      run.written = event.written
      run.speed = event.speed
      if (run.state === 'preparing') run.state = 'saving'
      return
    case 'file-open': {
      try {
        const outlet =
          run.sink === 'stream'
            ? await openStreamOutlet(event.name, event.bytes)
            : memoryOutlet(event.name, run.mime)
        outlets.set(key(event.taskId, event.file), outlet)
        post({ type: 'opened', taskId: event.taskId, file: event.file })
      } catch (error) {
        post({ type: 'cancel', taskId: event.taskId })
        fail(run, {
          code: 'OUTLET_FAILED',
          message: error instanceof Error ? error.message : '无法开始保存文件',
          file: event.file,
        })
      }
      return
    }
    case 'file-chunk': {
      const outlet = outlets.get(key(event.taskId, event.file))
      if (outlet) await outlet.write(event.data)
      post({ type: 'ack', taskId: event.taskId, file: event.file, seq: event.seq })
      return
    }
    case 'file-close': {
      const id = key(event.taskId, event.file)
      await outlets.get(id)?.close()
      outlets.delete(id)
      return
    }
    case 'file-abort': {
      const id = key(event.taskId, event.file)
      await outlets.get(id)?.abort()
      outlets.delete(id)
      return
    }
    case 'done':
      run.state = 'done'
      run.speed = 0
      interrupted.delete(event.taskId)
      return
    case 'paused':
      run.state = 'paused'
      run.speed = 0
      if (run.sink === 'fs') interrupted.add(event.taskId)
      return
    case 'error':
      fail(run, event.failure)
      if (run.sink === 'fs') interrupted.add(event.taskId)
  }
}

async function restore() {
  if (restored || import.meta.server) return
  restored = true
  for (const record of await listRuns()) interrupted.add(record.taskId)
}

export function useDownloadEngine() {
  void restore()
  const capabilities = {
    directory: directorySupported(),
    stream: streamSupported(),
  }

  function preferredSink(): SinkKind {
    if (capabilities.directory) return 'fs'
    if (capabilities.stream) return 'stream'
    return 'memory'
  }

  async function pickDirectory() {
    try {
      return await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads',
        id: 'hikarinagi-downloads',
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return null
      throw error
    }
  }

  function requestManifest(taskId: number, maxCards = 0) {
    return hikariRequest('/api/v3/user/me/downloads/{id}/manifest', {
      method: 'post',
      path: { id: taskId },
      body: { max_cards: maxCards },
    })
  }

  function start(options: {
    task: Pick<DownloadTask, 'id' | 'title' | 'format'>
    manifest: DownloadManifest
    sink: SinkKind
    directory: FileSystemDirectoryHandle | null
  }) {
    const { task, manifest, sink, directory } = options
    const snapshot: RunSnapshot & { mime: string } = {
      taskId: task.id,
      title: task.title,
      sink,
      state: 'preparing',
      files: manifest.files.map(file => ({
        index: file.index,
        name: file.name,
        bytes: file.bytes,
        written: 0,
        state: 'waiting',
      })),
      written: 0,
      total: manifest.files.reduce((sum, file) => sum + file.bytes, 0),
      speed: 0,
      error: null,
      location: directory?.name ?? null,
      mime: mimeOf(task.format),
    }
    runs.set(task.id, snapshot)
    post({
      type: 'start',
      taskId: task.id,
      manifest,
      title: task.title,
      sink,
      directory,
      stamp: dosStamp(new Date()),
    })
    return snapshot
  }

  async function resume(task: Pick<DownloadTask, 'id' | 'title' | 'format'>, maxCards = 0) {
    const record = await loadRun(task.id)
    let directory: FileSystemDirectoryHandle | null = null
    let sink = preferredSink()
    if (record?.directory) {
      const permission = await record.directory.requestPermission({ mode: 'readwrite' })
      if (permission !== 'granted') throw new Error('需要重新授权文件夹访问权限才能继续')
      directory = record.directory
      sink = 'fs'
    } else if (sink === 'fs') {
      directory = await pickDirectory()
      if (!directory) return null
    }
    const manifest = await requestManifest(task.id, maxCards)
    return start({ task, manifest, sink, directory })
  }

  function pause(taskId: number) {
    post({ type: 'pause', taskId })
  }

  async function cancel(taskId: number) {
    post({ type: 'cancel', taskId })
    runs.delete(taskId)
    interrupted.delete(taskId)
    await deleteRun(taskId)
  }

  function forget(taskId: number) {
    runs.delete(taskId)
  }

  const active = computed(() =>
    [...runs.values()].filter(run => run.state === 'preparing' || run.state === 'saving'),
  )

  return {
    runs,
    active,
    interrupted,
    capabilities,
    preferredSink,
    pickDirectory,
    requestManifest,
    start,
    resume,
    pause,
    cancel,
    forget,
  }
}
