import { TaskRunner, type RunnerIo } from './runner'
import type { ManifestFile, WorkerCommand, WorkerEvent } from './types'

const ACK_WINDOW = 8
const scope = self as unknown as {
  postMessage(message: WorkerEvent, transfer?: Transferable[]): void
  onmessage: ((event: MessageEvent<WorkerCommand>) => void) | null
}
const waits = new Map<string, () => void>()
let current: TaskRunner | null = null

function wait(key: string) {
  return new Promise<void>(resolve => waits.set(key, resolve))
}

function release(key: string) {
  const resolve = waits.get(key)
  if (!resolve) return
  waits.delete(key)
  resolve()
}

function io(taskId: number): RunnerIo {
  const inflight: number[] = []
  return {
    post(event: WorkerEvent, transfer?: Transferable[]) {
      scope.postMessage(event, transfer ?? [])
    },
    async openPort(file: ManifestFile) {
      const ready = wait(`open:${taskId}:${file.index}`)
      scope.postMessage({
        type: 'file-open',
        taskId,
        file: file.index,
        name: file.name,
        bytes: file.bytes,
      } satisfies WorkerEvent)
      await ready
    },
    async sendChunk(file: number, seq: number, data: ArrayBuffer) {
      const acked = wait(`ack:${taskId}:${file}:${seq}`)
      inflight.push(seq)
      scope.postMessage({ type: 'file-chunk', taskId, file, seq, data } satisfies WorkerEvent, [
        data,
      ])
      if (inflight.length >= ACK_WINDOW) {
        await acked
        inflight.splice(inflight.indexOf(seq), 1)
      } else {
        void acked.then(() => inflight.splice(inflight.indexOf(seq), 1))
      }
    },
    closePort(file: number) {
      scope.postMessage({ type: 'file-close', taskId, file } satisfies WorkerEvent)
    },
    abortPort(file: number) {
      scope.postMessage({ type: 'file-abort', taskId, file } satisfies WorkerEvent)
    },
  }
}

scope.onmessage = (event: MessageEvent<WorkerCommand>) => {
  const command = event.data
  switch (command.type) {
    case 'start': {
      current?.cancel()
      const runner = new TaskRunner(command, io(command.taskId))
      current = runner
      void runner.run().finally(() => {
        if (current === runner) current = null
      })
      return
    }
    case 'pause':
      if (current?.taskId === command.taskId) current.pause()
      return
    case 'cancel':
      if (current?.taskId === command.taskId) current.cancel()
      return
    case 'opened':
      release(`open:${command.taskId}:${command.file}`)
      return
    case 'ack':
      release(`ack:${command.taskId}:${command.file}:${command.seq}`)
  }
}
