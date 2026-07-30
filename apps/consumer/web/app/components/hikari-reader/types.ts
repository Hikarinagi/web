import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { Reader } from '@ritojs/core/web'
import type { ReaderController } from '@ritojs/kit'
import type { Ref } from 'vue'

export type BackendReaderSettings = ApiData<'/api/v3/reader/settings', 'get'>
export type BackendReaderVolumeState = ApiData<'/api/v3/reader/volumes/{volume_id}/state', 'get'>

export interface HikariReaderInput {
  volumeId: number
  settings: Ref<BackendReaderSettings>
  state: BackendReaderVolumeState
}

export interface ReaderViewport {
  width: number
  height: number
}

export interface ReaderStack {
  reader: Reader
  controller: ReaderController
}

export type ReaderSpreadMode = 'single' | 'double'
