import { defineEventHandler, setResponseStatus } from 'h3'

const PROBE_PATH = '/health/render-probe'
const RENDERED_MARK = 'id="__nuxt"'

export default defineEventHandler(async event => {
  try {
    const html = await event.$fetch<string>(PROBE_PATH, {
      responseType: 'text',
      ignoreResponseError: true,
    })
    if (typeof html === 'string' && html.includes(RENDERED_MARK)) {
      return { ok: true, render: 'ok' }
    }
    setResponseStatus(event, 503)
    return { ok: false, render: 'fallback' }
  } catch (error) {
    setResponseStatus(event, 503)
    return {
      ok: false,
      render: 'error',
      message: error instanceof Error ? error.message : String(error),
    }
  }
})
