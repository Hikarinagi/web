import openSpec from '@hikarinagi/api-contract/openapi/open.json'

export interface ReferenceParam {
  name: string
  required: boolean
  type: string
  description?: string
}

export interface ReferenceField {
  name: string
  type: string
  required: boolean
  description?: string
  children?: ReferenceField[]
}

export interface ReferenceOperation {
  id: string
  method: string
  path: string
  summary?: string
  description?: string
  params: ReferenceParam[]
  request?: ReferenceField[]
  response?: ReferenceField[]
  paginated: boolean
  curl: string
}

export interface ReferenceGroup {
  tag: string
  title: string
  description?: string
  operations: ReferenceOperation[]
}

interface SpecSchema {
  type?: string
  allOf?: SpecSchema[]
  properties?: Record<string, SpecSchema>
  required?: string[]
  items?: SpecSchema
  $ref?: string
  nullable?: boolean
  enum?: (string | number)[]
  description?: string
  additionalProperties?: SpecSchema | boolean
}

interface SpecOperation {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: {
    name: string
    in: string
    required?: boolean
    description?: string
    schema?: SpecSchema
  }[]
  requestBody?: { content?: Record<string, { schema?: SpecSchema }> }
  responses?: Record<string, { content?: Record<string, { schema?: SpecSchema }> }>
}

interface SpecDoc {
  paths: Record<string, Record<string, SpecOperation>>
  components: { schemas: Record<string, SpecSchema> }
  tags?: { name: string; description?: string }[]
}

const spec = openSpec as unknown as SpecDoc

const TAG_TITLE: Record<string, string> = {
  open: '条目数据',
  developer: '应用管理',
}

const EXAMPLE_VALUE: Record<string, string> = { id: '1', client_id: 'hkn_yourclientid' }
const EXAMPLE_BODY: Record<string, unknown> = { client_name: 'My App', enabled: true }

function resolveRef(schema: SpecSchema): { schema: SpecSchema; refName?: string } {
  const ref = schema.$ref ?? schema.allOf?.find(entry => entry.$ref)?.$ref
  if (!ref) return { schema }
  const refName = ref.split('/').pop() as string
  return { schema: spec.components.schemas[refName] ?? {}, refName }
}

function typeLabel(schema: SpecSchema): string {
  const ref = schema.$ref ?? schema.allOf?.find(entry => entry.$ref)?.$ref
  if (ref) {
    const name = ref.split('/').pop() as string
    const resolved = spec.components.schemas[name]
    const base = resolved?.enum ? resolved.enum.map(value => JSON.stringify(value)).join(' | ') : name
    return schema.nullable ? `${base} | null` : base
  }
  if (schema.enum) return schema.enum.map(value => JSON.stringify(value)).join(' | ')
  if (schema.type === 'array') return `${typeLabel(schema.items ?? {})}[]`
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    return `Record<string, ${typeLabel(schema.additionalProperties)}>`
  }
  const base = schema.type ?? 'object'
  return schema.nullable ? `${base} | null` : base
}

function fieldsOf(schema: SpecSchema, depth = 0): ReferenceField[] {
  const { schema: resolved } = resolveRef(schema)
  if (!resolved.properties) return []
  const required = new Set(resolved.required ?? [])
  return Object.entries(resolved.properties).map(([name, property]) => {
    const inner = property.type === 'array' ? (property.items ?? {}) : property
    const { schema: child, refName } = resolveRef(inner)
    const expandable = Boolean(refName && child.properties && depth < 2)
    return {
      name,
      type: typeLabel(property),
      required: required.has(name),
      description: property.description,
      ...(expandable ? { children: fieldsOf(child, depth + 1) } : {}),
    }
  })
}

function buildCurl(method: string, path: string, op: SpecOperation, base: string): string {
  const url = path.replace(/\{(\w+)\}/g, (_, name: string) => EXAMPLE_VALUE[name] ?? '1')
  const query =
    method === 'GET' && op.parameters?.some(p => p.in === 'query') ? '?page=1&page_size=10' : ''
  const lines = [`curl "${base}${url}${query}" \\`]
  if (method !== 'GET') lines[0] = `curl -X ${method} "${base}${url}" \\`
  lines.push('  -H "Authorization: Bearer $ACCESS_TOKEN"')
  const bodySchema = op.requestBody?.content?.['application/json']?.schema
  if (bodySchema) {
    const fields = fieldsOf(bodySchema).filter(field => field.name in EXAMPLE_BODY)
    const body = Object.fromEntries(fields.map(field => [field.name, EXAMPLE_BODY[field.name]]))
    lines[lines.length - 1] += ' \\'
    lines.push('  -H "Content-Type: application/json" \\')
    lines.push(`  -d '${JSON.stringify(body)}'`)
  }
  return lines.join('\n')
}

function toOperation(
  method: string,
  path: string,
  op: SpecOperation,
  base: string,
): ReferenceOperation {
  const rawResponse = op.responses?.['200']?.content?.['application/json']?.schema
  const responseSchema = rawResponse?.type === 'array' ? rawResponse.items : rawResponse
  const requestSchema = op.requestBody?.content?.['application/json']?.schema
  const resolvedResponse = responseSchema ? resolveRef(responseSchema).schema : undefined
  const paginated = Boolean(
    resolvedResponse?.properties?.items && resolvedResponse?.properties?.meta,
  )
  return {
    id: op.operationId ?? `${method}-${path}`,
    method: method.toUpperCase(),
    path,
    summary: op.summary,
    description: op.description,
    params: (op.parameters ?? []).map(parameter => ({
      name: parameter.name,
      required: parameter.required ?? false,
      type: typeLabel(parameter.schema ?? {}),
      description: parameter.description,
    })),
    ...(requestSchema ? { request: fieldsOf(requestSchema) } : {}),
    paginated,
    ...(responseSchema ? { response: fieldsOf(responseSchema) } : {}),
    curl: buildCurl(method.toUpperCase(), path, op, base),
  }
}

export function referenceGroups(base: string): ReferenceGroup[] {
  const tags = spec.tags ?? []
  return tags.map(tag => ({
    tag: tag.name,
    title: TAG_TITLE[tag.name] ?? tag.name,
    description: tag.description,
    operations: Object.entries(spec.paths).flatMap(([path, methods]) =>
      Object.entries(methods)
        .filter(([, op]) => op.tags?.includes(tag.name))
        .map(([method, op]) => toOperation(method, path, op, base)),
    ),
  }))
}
