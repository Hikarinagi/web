import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ZipStamp } from './zip'

export type DownloadManifest = ApiData<'/api/v3/user/me/downloads/{id}/manifest', 'post'>
export type ManifestFile = DownloadManifest['files'][number]
export type ManifestEntry = ManifestFile['entries'][number]

export type SinkKind = 'fs' | 'stream' | 'memory'

export type FileState = 'waiting' | 'saving' | 'done' | 'error'

export interface FileProgress {
  index: number
  name: string
  bytes: number
  written: number
  state: FileState
}

export type RunState = 'preparing' | 'saving' | 'paused' | 'done' | 'error'

export interface RunSnapshot {
  taskId: number
  title: string
  sink: SinkKind
  state: RunState
  files: FileProgress[]
  written: number
  total: number
  speed: number
  error: DownloadFailure | null
  location: string | null
  mime: string
}

export interface DownloadFailure {
  code: string
  message: string
  file: number | null
}

export interface FileRunState {
  handle: FileSystemFileHandle | null
  done: number[]
  crcs: Record<number, number>
  complete: boolean
}

export interface RunRecord {
  taskId: number
  title: string
  directory: FileSystemDirectoryHandle | null
  files: Record<number, FileRunState>
  updatedAt: number
}

export interface StartCommand {
  type: 'start'
  taskId: number
  manifest: DownloadManifest
  title: string
  sink: SinkKind
  directory: FileSystemDirectoryHandle | null
  stamp: ZipStamp
}

export type WorkerCommand =
  | StartCommand
  | { type: 'pause'; taskId: number }
  | { type: 'cancel'; taskId: number }
  | { type: 'opened'; taskId: number; file: number }
  | { type: 'ack'; taskId: number; file: number; seq: number }

export type WorkerEvent =
  | { type: 'progress'; taskId: number; files: FileProgress[]; written: number; speed: number }
  | { type: 'file-open'; taskId: number; file: number; name: string; bytes: number }
  | { type: 'file-chunk'; taskId: number; file: number; seq: number; data: ArrayBuffer }
  | { type: 'file-close'; taskId: number; file: number }
  | { type: 'file-abort'; taskId: number; file: number }
  | { type: 'done'; taskId: number }
  | { type: 'paused'; taskId: number }
  | { type: 'error'; taskId: number; failure: DownloadFailure }
