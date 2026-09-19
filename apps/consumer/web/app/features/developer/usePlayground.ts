import type { FormValidator } from '@hina-ui/vue'
import type { ReferenceOperation, ReferenceParam } from '~~/server/features/developer/reference'
import { useApiToken } from '~/features/developer/useApiToken'

export type PlaygroundValue = string | string[]

export interface PlaygroundResult {
  status: number
  statusText: string
  durationMs: number
  headers: { name: string; value: string }[]
  bizCode?: string
  body: string
}

const BODY_FIELD = '__body'

function seedValue(param: ReferenceParam): PlaygroundValue {
  if (param.control.kind === 'enum' && param.control.multiple) return []
  return param.defaultValue ?? ''
}

function toQueryValue(value: PlaygroundValue) {
  return Array.isArray(value) ? value.join(',') : value
}

export function usePlayground(operation: () => ReferenceOperation, base: () => string) {
  const { token, configured } = useApiToken()

  const values = reactive<Record<string, PlaygroundValue>>(Object.create(null))
  const pending = ref(false)
  const result = ref<PlaygroundResult | null>(null)

  const pathParams = computed(() => operation().params.filter(param => param.in === 'path'))
  const queryParams = computed(() => operation().params.filter(param => param.in === 'query'))
  const acceptsBody = computed(() => Boolean(operation().request?.length))

  watch(
    operation,
    current => {
      for (const key of Object.keys(values)) values[key] = ''
      for (const param of current.params) values[param.name] = seedValue(param)
      values[BODY_FIELD] = current.request?.length ? '{}' : ''
      result.value = null
    },
    { immediate: true },
  )

  const rules: FormValidator = data => {
    const errors: Record<string, string> = {}
    for (const param of operation().params) {
      if (param.in !== 'path' && !param.required) continue
      if (!toQueryValue((data[param.name] ?? '') as PlaygroundValue)) errors[param.name] = '必填'
    }
    if (acceptsBody.value) {
      const raw = String(data[BODY_FIELD] ?? '').trim()
      if (raw) {
        try {
          JSON.parse(raw)
        } catch {
          errors[BODY_FIELD] = '不是合法的 JSON'
        }
      }
    }
    return errors
  }

  const requestUrl = computed(() => {
    const path = pathParams.value.reduce(
      (acc, param) =>
        acc.replace(`{${param.name}}`, toQueryValue(values[param.name] ?? '') || `{${param.name}}`),
      operation().path,
    )
    const query = new URLSearchParams()
    for (const param of queryParams.value) {
      const value = toQueryValue(values[param.name] ?? '')
      if (value) query.set(param.name, value)
    }
    const search = query.toString()
    return `${base()}${path}${search ? `?${search}` : ''}`
  })

  const bodyText = computed({
    get: () => String(values[BODY_FIELD] ?? ''),
    set: value => {
      values[BODY_FIELD] = value
    },
  })
  const body = computed(() => bodyText.value.trim())
  const sendsBody = computed(() => acceptsBody.value && Boolean(body.value))

  const curl = computed(() => {
    const lines = [`curl -X ${operation().method} "${requestUrl.value}" \\`]
    lines.push(`  -H "Authorization: Bearer ${token.value || '$ACCESS_TOKEN'}"`)
    if (sendsBody.value) {
      lines[lines.length - 1] += ' \\'
      lines.push('  -H "Content-Type: application/json" \\')
      lines.push(`  -d '${body.value.replace(/\s+/g, ' ')}'`)
    }
    return lines.join('\n')
  })

  async function send() {
    if (!configured.value) return
    pending.value = true
    const startedAt = performance.now()
    try {
      const response = await fetch(requestUrl.value, {
        method: operation().method,
        headers: {
          Authorization: `Bearer ${token.value}`,
          ...(sendsBody.value ? { 'content-type': 'application/json' } : {}),
        },
        ...(sendsBody.value ? { body: body.value } : {}),
      })
      const text = await response.text()
      result.value = {
        status: response.status,
        statusText: response.statusText,
        durationMs: Math.round(performance.now() - startedAt),
        headers: [...response.headers.entries()].map(([name, value]) => ({ name, value })),
        bizCode: bizCodeOf(text),
        body: format(text),
      }
    } catch (error) {
      result.value = {
        status: 0,
        statusText: '请求未能送达',
        durationMs: Math.round(performance.now() - startedAt),
        headers: [],
        body: String(error),
      }
    } finally {
      pending.value = false
    }
  }

  return {
    values,
    rules,
    bodyField: BODY_FIELD,
    bodyText,
    pathParams,
    queryParams,
    acceptsBody,
    requestUrl,
    curl,
    pending,
    result,
    send,
  }
}

function bizCodeOf(text: string) {
  try {
    const payload = JSON.parse(text) as { error?: { code?: string } }
    return payload.error?.code
  } catch {
    return undefined
  }
}

function format(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}
