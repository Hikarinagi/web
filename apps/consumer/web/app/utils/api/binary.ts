import { normalizeApiError } from './error'
import { unwrapApiResponse } from './response'

export interface DownloadProgress {
  loaded: number
  total: number | null
}

export async function readApiBinary(
  response: { status: number; headers: Headers; _data?: ReadableStream<Uint8Array> },
  onDownload?: (progress: DownloadProgress) => void,
): Promise<ArrayBuffer> {
  const stream = response._data
  if (response.headers.get('content-type')?.includes('application/json')) {
    const body = await new Response(stream).json()
    if (response.status >= 400) {
      throw normalizeApiError({ statusCode: response.status, data: body })
    }
    unwrapApiResponse(body)
    throw new Error('文件响应格式不正确')
  }
  if (response.status >= 400 || !stream) {
    await stream?.cancel().catch(() => {})
    throw normalizeApiError({ statusCode: response.status })
  }
  const declared = Number(response.headers.get('content-length'))
  const total = declared > 0 && Number.isFinite(declared) ? declared : null
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  onDownload?.({ loaded, total })
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      chunks.push(value)
      loaded += value.byteLength
      onDownload?.({ loaded, total })
    }
  } catch (error) {
    await reader.cancel().catch(() => {})
    throw error
  } finally {
    reader.releaseLock()
  }
  const buffer = new ArrayBuffer(loaded)
  const bytes = new Uint8Array(buffer)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return buffer
}
