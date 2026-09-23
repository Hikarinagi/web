import type { Instrumentation } from '@opentelemetry/instrumentation'

import { ATTR_ENTRY_NAME, ENTRIES, type Entry, type SampleRates } from './entry'
import { ATTR_REQUEST_ID, spanOfRequest, type NodeTelemetryOptions } from './index'
import { NestScheduleInstrumentation } from './schedule'

export const DEFAULT_REQUEST_ID_HEADER = 'hikari-request-id'

export const PRESETS = ['fastify', 'graphql', 'prisma', 'ioredis', 'schedule'] as const

export type Preset = (typeof PRESETS)[number]

export function optionsFromEnv(env: NodeJS.ProcessEnv): NodeTelemetryOptions | null {
  const endpoint = env.APM_ENDPOINT?.trim()
  const key = env.APM_INGEST_KEY?.trim()
  const service = env.APM_SERVICE_NAME?.trim()
  if (!endpoint || !key || !service) return null
  return {
    service,
    version: env.APM_SERVICE_VERSION?.trim() || env.APP_VERSION?.trim() || 'dev',
    environment: env.APM_ENVIRONMENT?.trim() || 'unknown',
    endpoint,
    key,
    sampleRate: rateOf(env.APM_SAMPLE_RATE) ?? 1,
    sampleRates: sampleRatesFromEnv(env),
    requestIdHeader: env.APM_REQUEST_ID_HEADER?.trim() || DEFAULT_REQUEST_ID_HEADER,
  }
}

export function sampleRatesFromEnv(env: NodeJS.ProcessEnv): SampleRates {
  const rates: SampleRates = {}
  for (const entry of ENTRIES) {
    const rate = rateOf(env[`APM_SAMPLE_RATE_${entry.toUpperCase()}`])
    if (rate !== undefined) rates[entry as Entry] = rate
  }
  const bot = rateOf(env.APM_SAMPLE_RATE_BOT)
  if (bot !== undefined) rates.bot = bot
  return rates
}

function rateOf(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined
  const rate = Number(raw)
  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : undefined
}

export function presetsFromEnv(env: NodeJS.ProcessEnv): string[] {
  return (env.APM_INSTRUMENTATIONS ?? '')
    .split(',')
    .map(name => name.trim().toLowerCase())
    .filter(name => name.length > 0)
}

export function loadPresets(
  names: string[],
  load: (module: string) => unknown = name => require(name),
  warn: (message: string) => void = message => process.stderr.write(`[apm] ${message}\n`),
): Instrumentation[] {
  const out: Instrumentation[] = []
  for (const name of names) {
    const factory = factories[name as Preset]
    if (!factory) {
      warn(`unknown instrumentation preset "${name}"`)
      continue
    }
    try {
      out.push(factory(load))
    } catch (error) {
      warn(`instrumentation preset "${name}" is unavailable: ${(error as Error).message}`)
    }
  }
  return out
}

type Loader = (module: string) => unknown

const factories: Record<Preset, (load: Loader) => Instrumentation> = {
  fastify: load => {
    const mod = load('@fastify/otel') as { default?: FastifyCtor } & FastifyCtor
    const Ctor = mod.default ?? mod
    return new Ctor({
      registerOnInitialization: true,
      instrumentHooks: false,
      instrumentHandler: false,
      requestHook: (span, request) => {
        const route = request.routeOptions?.url
        const entryName = route ? `${request.method ?? 'GET'} ${route}` : undefined
        const server = request.raw ? spanOfRequest(request.raw) : undefined
        span.setAttribute(ATTR_REQUEST_ID, String(request.id))
        server?.setAttribute(ATTR_REQUEST_ID, String(request.id))
        if (!entryName) return
        span.setAttribute(ATTR_ENTRY_NAME, entryName)
        server?.setAttribute(ATTR_ENTRY_NAME, entryName)
      },
    })
  },
  graphql: load => {
    const { GraphQLInstrumentation } = load('@opentelemetry/instrumentation-graphql') as {
      GraphQLInstrumentation: new (config: Record<string, unknown>) => Instrumentation
    }
    return new GraphQLInstrumentation({
      depth: 2,
      ignoreTrivialResolveSpans: true,
      mergeItems: true,
    })
  },
  prisma: load => {
    const { PrismaInstrumentation } = load('@prisma/instrumentation') as {
      PrismaInstrumentation: new (config: { ignoreSpanTypes: string[] }) => Instrumentation
    }
    return new PrismaInstrumentation({ ignoreSpanTypes: ['prisma:client:serialize'] })
  },
  ioredis: load => {
    const { IORedisInstrumentation } = load('@opentelemetry/instrumentation-ioredis') as {
      IORedisInstrumentation: new () => Instrumentation
    }
    return new IORedisInstrumentation()
  },
  schedule: () => new NestScheduleInstrumentation(),
}

type FastifyCtor = new (config: {
  registerOnInitialization: boolean
  instrumentHooks: boolean
  instrumentHandler: boolean
  requestHook: (
    span: { setAttribute: (key: string, value: string) => unknown },
    request: {
      id: unknown
      method?: string
      raw?: import('node:http').IncomingMessage
      routeOptions?: { url?: string }
    },
  ) => void
}) => Instrumentation
