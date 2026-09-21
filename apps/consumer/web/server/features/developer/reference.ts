import { highlightCode } from '../../utils/code-highlight'
import openSpec from '@hikarinagi/api-contract/openapi/open.json'

export type ReferenceControl =
  | { kind: 'string'; maxLength?: number }
  | { kind: 'number'; min?: number; max?: number }
  | { kind: 'boolean' }
  | { kind: 'enum'; multiple: boolean; options: ReferenceEnumValue[] }

export interface ReferenceParam {
  name: string
  in: string
  required: boolean
  type: string
  description?: string
  defaultValue?: string
  control: ReferenceControl
}

export interface ReferenceEnumValue {
  value: string
  label: string
}

export interface ReferenceField {
  name: string
  type: string
  required: boolean
  description?: string
  enumValues?: ReferenceEnumValue[]
  children?: ReferenceField[]
}

export type ReferenceAuth = 'app' | 'user'

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
  responseIsArray: boolean
  scopes: string[]
  auth: ReferenceAuth
  statuses: { code: string; label: string }[]
  curl: string
  js: string
  curlHtml: string
  jsHtml: string
  responseExample?: string
  responseHtml?: string
}

export interface ReferenceGroup {
  tag: string
  title: string
  description?: string
  auth: ReferenceAuth
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
  'x-enum-descriptions'?: Record<string, string>
  description?: string
  additionalProperties?: SpecSchema | boolean
  default?: string | number | boolean
  minimum?: number
  maximum?: number
  maxLength?: number
}

interface SpecOperation {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  'x-hikari-scopes'?: string[]
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
  'open-user-profile': '用户资料',
  'open-user-rate': '状态与评分',
  'open-user-collection': '收藏夹',
}

const TAG_AUTH: Record<string, ReferenceAuth> = {
  open: 'app',
  'open-user-profile': 'user',
  'open-user-rate': 'user',
  'open-user-collection': 'user',
}

const TOKEN_VARIABLE: Record<ReferenceAuth, string> = {
  app: '$ACCESS_TOKEN',
  user: '$ACCESS_TOKEN',
}

const STATUS_LABEL: Record<string, string> = {
  '200': '成功',
  '201': '已创建',
  '204': '成功，无响应体',
}

const EXAMPLE_VALUE: Record<string, string> = { id: '1', client_id: 'hkn_yourclientid' }

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
    const base =
      resolved?.enum && !resolved['x-enum-descriptions']
        ? resolved.enum.map(value => JSON.stringify(value)).join(' | ')
        : name
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

function enumOptions(schema: SpecSchema): ReferenceEnumValue[] {
  const { schema: resolved } = resolveRef(schema)
  const labels = schema['x-enum-descriptions'] ?? resolved['x-enum-descriptions']
  const values = resolved.enum ?? schema.enum ?? []
  return values.map(value => ({
    value: String(value),
    label: labels?.[String(value)] ?? String(value),
  }))
}

function controlOf(schema: SpecSchema): ReferenceControl {
  if (schema.type === 'array') {
    const options = enumOptions(schema.items ?? {})
    if (options.length) return { kind: 'enum', multiple: true, options }
    return { kind: 'string' }
  }
  const options = enumOptions(schema)
  if (options.length) return { kind: 'enum', multiple: false, options }
  if (schema.type === 'boolean') return { kind: 'boolean' }
  if (schema.type === 'number' || schema.type === 'integer') {
    return {
      kind: 'number',
      ...(schema.minimum !== undefined ? { min: schema.minimum } : {}),
      ...(schema.maximum !== undefined ? { max: schema.maximum } : {}),
    }
  }
  return {
    kind: 'string',
    ...(schema.maxLength !== undefined ? { maxLength: schema.maxLength } : {}),
  }
}

function fieldsOf(schema: SpecSchema, depth = 0): ReferenceField[] {
  const { schema: resolved } = resolveRef(schema)
  if (!resolved.properties) return []
  const required = new Set(resolved.required ?? [])
  return Object.entries(resolved.properties).map(([name, property]) => {
    const inner = property.type === 'array' ? (property.items ?? {}) : property
    const { schema: child, refName } = resolveRef(inner)
    const expandable = Boolean(refName && child.properties && depth < 2)
    const enumLabels = property['x-enum-descriptions'] ?? child['x-enum-descriptions']
    return {
      name,
      type: typeLabel(property),
      required: required.has(name),
      description: property.description,
      ...(enumLabels
        ? { enumValues: Object.entries(enumLabels).map(([value, label]) => ({ value, label })) }
        : {}),
      ...(expandable ? { children: fieldsOf(child, depth + 1) } : {}),
    }
  })
}

function buildCurl(
  method: string,
  path: string,
  op: SpecOperation,
  base: string,
  auth: ReferenceAuth,
): string {
  const url = path.replace(/\{(\w+)\}/g, (_, name: string) => EXAMPLE_VALUE[name] ?? '1')
  const query =
    method === 'GET' && op.parameters?.some(p => p.in === 'query') ? '?page=1&page_size=10' : ''
  const lines = [`curl "${base}${url}${query}" \\`]
  if (method !== 'GET') lines[0] = `curl -X ${method} "${base}${url}" \\`
  lines.push(`  -H "Authorization: Bearer ${TOKEN_VARIABLE[auth]}"`)
  const bodySchema = op.requestBody?.content?.['application/json']?.schema
  if (bodySchema) {
    lines[lines.length - 1] += ' \\'
    lines.push('  -H "Content-Type: application/json" \\')
    lines.push(`  -d '${requestExample(bodySchema, '  ')}'`)
  }
  return lines.join('\n')
}
function exampleOf(schema: SpecSchema, name = '', depth = 0): unknown {
  const { schema: resolved } = resolveRef(schema)
  if (resolved.enum?.length) return resolved.enum[0]
  if (resolved.type === 'array') {
    return depth > 4 ? [] : [exampleOf(resolved.items ?? {}, name, depth + 1)]
  }
  if (resolved.properties) {
    if (depth > 4) return {}
    return Object.fromEntries(
      Object.entries(resolved.properties).map(([key, property]) => [
        key,
        exampleOf(property, key, depth + 1),
      ]),
    )
  }
  if (resolved.type === 'integer' || resolved.type === 'number') return 1
  if (resolved.type === 'boolean') return false
  if (resolved.type === 'string') {
    if (/_at$/.test(name)) return '2026-08-02T00:00:00.000Z'
    if (/^(src|url|logo|avatar|cover)$|_url$/.test(name)) return 'path/to/asset.jpg'
    return 'string'
  }
  return null
}

function requestExample(schema: SpecSchema, pad: string): string {
  return JSON.stringify(exampleOf(schema, '', 0), null, 2)
    .split('\n')
    .join(`\n${pad}`)
}

function buildJs(
  method: string,
  path: string,
  op: SpecOperation,
  base: string,
  auth: ReferenceAuth,
): string {
  const url = path.replace(/\{(\w+)\}/g, (_, name: string) => EXAMPLE_VALUE[name] ?? '1')
  const query =
    method === 'GET' && op.parameters?.some(p => p.in === 'query') ? '?page=1&page_size=10' : ''
  const bodySchema = op.requestBody?.content?.['application/json']?.schema
  const options = [`  method: '${method}',`, '  headers: {']
  options.push(`    Authorization: \`Bearer \${${TOKEN_VARIABLE[auth].slice(1)}}\`,`)
  if (bodySchema) options.push("    'Content-Type': 'application/json',")
  options.push('  },')
  if (bodySchema) {
    options.push(`  body: JSON.stringify(${requestExample(bodySchema, '  ')}),`)
  }
  return [
    `const res = await fetch('${base}${url}${query}', {`,
    ...options,
    '})',
    'const { data } = await res.json()',
  ].join('\n')
}

function toOperation(
  method: string,
  path: string,
  op: SpecOperation,
  base: string,
  auth: ReferenceAuth,
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
      in: parameter.in,
      required: parameter.required ?? false,
      type: typeLabel(parameter.schema ?? {}),
      description: parameter.description,
      ...(parameter.schema?.default !== undefined
        ? { defaultValue: String(parameter.schema.default) }
        : {}),
      control: controlOf(parameter.schema ?? {}),
    })),
    ...(requestSchema ? { request: fieldsOf(requestSchema) } : {}),
    paginated,
    responseIsArray: rawResponse?.type === 'array',
    ...(responseSchema ? { response: fieldsOf(responseSchema) } : {}),
    scopes: op['x-hikari-scopes'] ?? [],
    auth,
    statuses: Object.keys(op.responses ?? {})
      .sort()
      .map(code => ({ code, label: STATUS_LABEL[code] ?? '' })),
    curl: buildCurl(method.toUpperCase(), path, op, base, auth),
    js: buildJs(method.toUpperCase(), path, op, base, auth),
    curlHtml: '',
    jsHtml: '',
    ...(responseSchema
      ? { responseExample: JSON.stringify(exampleOf(rawResponse ?? {}, '', 0), null, 2) }
      : {}),
  }
}

export async function highlightOperation(
  operation: ReferenceOperation,
): Promise<ReferenceOperation> {
  return {
    ...operation,
    curlHtml: await highlightCode(operation.curl, 'bash'),
    jsHtml: await highlightCode(operation.js, 'javascript'),
    ...(operation.responseExample
      ? { responseHtml: await highlightCode(operation.responseExample, 'json') }
      : {}),
  }
}

export interface ReferenceNavGroup {
  tag: string
  title: string
  auth: ReferenceAuth
  operations: { id: string; method: string; path: string; summary?: string; scopes: string[] }[]
}

export function referenceNav(base: string): ReferenceNavGroup[] {
  return referenceGroups(base).map(group => ({
    tag: group.tag,
    title: group.title,
    auth: group.auth,
    operations: group.operations.map(operation => ({
      id: operation.id,
      method: operation.method,
      path: operation.path,
      summary: operation.summary,
      scopes: operation.scopes,
    })),
  }))
}

function buildGroups(base: string): ReferenceGroup[] {
  const tags = spec.tags ?? []
  return tags.map(tag => {
    const auth = TAG_AUTH[tag.name] ?? 'app'
    return {
      tag: tag.name,
      title: TAG_TITLE[tag.name] ?? tag.name,
      description: tag.description,
      auth,
      operations: Object.entries(spec.paths).flatMap(([path, methods]) =>
        Object.entries(methods)
          .filter(([, op]) => op.tags?.includes(tag.name))
          .map(([method, op]) => toOperation(method, path, op, base, auth)),
      ),
    }
  })
}

const groupsByBase = new Map<string, ReferenceGroup[]>()

export function referenceGroups(base: string): ReferenceGroup[] {
  const cached = groupsByBase.get(base)
  if (cached) return cached
  const groups = buildGroups(base)
  groupsByBase.set(base, groups)
  return groups
}

export interface ReferenceEntry {
  id: string
  method: string
  path: string
  summary?: string
  tag: string
  groupTitle: string
  auth: ReferenceAuth
  scopes: string[]
  paginated: boolean
}

export function referenceIndex(base: string): ReferenceEntry[] {
  return referenceGroups(base).flatMap(group =>
    group.operations.map(operation => ({
      id: operation.id,
      method: operation.method,
      path: operation.path,
      summary: operation.summary,
      tag: group.tag,
      groupTitle: group.title,
      auth: group.auth,
      scopes: operation.scopes,
      paginated: operation.paginated,
    })),
  )
}

export function referenceOperation(base: string, id: string) {
  for (const group of referenceGroups(base)) {
    const operation = group.operations.find(item => item.id === id)
    if (operation) return { group, operation }
  }
  return null
}

export function referenceOperationIds(): string[] {
  return Object.values(spec.paths).flatMap(methods =>
    Object.values(methods)
      .filter(op => op.tags?.some(tag => TAG_TITLE[tag] !== undefined))
      .map(op => op.operationId)
      .filter((id): id is string => Boolean(id)),
  )
}
