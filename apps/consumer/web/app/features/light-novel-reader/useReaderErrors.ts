import type { ReaderEngine } from './useReaderEngine'

const KEPT = 10

export interface ReaderError {
  at: string
  source: 'window' | 'promise' | 'engine' | 'rito'
  message: string
}

export function useReaderErrors(engine: ReaderEngine) {
  const recent = shallowRef<ReaderError[]>([])

  function record(source: ReaderError['source'], error: unknown) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    recent.value = [...recent.value, { at: new Date().toISOString(), source, message }].slice(-KEPT)
  }

  useEventListener(window, 'error', event => record('window', event.error ?? event.message))
  useEventListener(window, 'unhandledrejection', event => record('promise', event.reason))
  watch(engine.fault, fault => {
    if (fault) record('engine', `${engine.failure.value ?? 'unknown'} ${fault}`)
  })
  watch(engine.stack, (stack, _, onCleanup) => {
    if (!stack) return
    onCleanup(
      stack.controller.on('error', ({ source, message }) =>
        record('rito', `${source}: ${message}`),
      ),
    )
  })

  return { recent }
}

export type ReaderErrors = ReturnType<typeof useReaderErrors>
