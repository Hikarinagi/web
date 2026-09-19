import { describe, expect, it, vi } from 'vitest'

import { loadPresets, optionsFromEnv, presetsFromEnv } from '../src/env'

describe('optionsFromEnv', () => {
  it('stays off unless endpoint, key and service are all set', () => {
    expect(optionsFromEnv({ APM_ENDPOINT: 'http://x', APM_INGEST_KEY: 'k' })).toBeNull()
    expect(optionsFromEnv({ APM_ENDPOINT: 'http://x', APM_SERVICE_NAME: 'hikari-api' })).toBeNull()
  })

  it('reads the service, version, environment and sampling', () => {
    const options = optionsFromEnv({
      APM_ENDPOINT: 'http://apm:5030/',
      APM_INGEST_KEY: 'hkapm_x',
      APM_SERVICE_NAME: 'hikari-api',
      APP_VERSION: '3.0.0',
      APM_ENVIRONMENT: 'staging',
      APM_SAMPLE_RATE: '0.25',
    })
    expect(options).toMatchObject({
      service: 'hikari-api',
      version: '3.0.0',
      environment: 'staging',
      endpoint: 'http://apm:5030/',
      key: 'hkapm_x',
      sampleRate: 0.25,
      requestIdHeader: 'hikari-request-id',
    })
    expect(
      optionsFromEnv({
        APM_ENDPOINT: 'x',
        APM_INGEST_KEY: 'k',
        APM_SERVICE_NAME: 's',
        APM_SAMPLE_RATE: '7',
      })?.sampleRate,
    ).toBe(1)
  })
})

describe('presets', () => {
  it('parses the instrumentation list', () => {
    expect(presetsFromEnv({ APM_INSTRUMENTATIONS: ' Fastify, prisma,,graphql ' })).toEqual([
      'fastify',
      'prisma',
      'graphql',
    ])
    expect(presetsFromEnv({})).toEqual([])
  })

  it('instantiates known presets through the loader and skips missing ones', () => {
    const warn = vi.fn()
    const created: string[] = []
    const load = (name: string) => {
      if (name === '@fastify/otel') {
        return class {
          constructor(config: { requestHook: (span: any, request: any) => void }) {
            created.push(name)
            const span = { setAttribute: vi.fn() }
            config.requestHook(span, { id: 'req-1' })
            expect(span.setAttribute).toHaveBeenCalledWith('hikari.request_id', 'req-1')
          }
        }
      }
      if (name === '@prisma/instrumentation') {
        return {
          PrismaInstrumentation: class {
            constructor() {
              created.push(name)
            }
          },
        }
      }
      throw new Error(`Cannot find module '${name}'`)
    }
    const out = loadPresets(['fastify', 'prisma', 'graphql', 'nope'], load, warn)
    expect(out).toHaveLength(2)
    expect(created).toEqual(['@fastify/otel', '@prisma/instrumentation'])
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[0]![0]).toContain('graphql')
    expect(warn.mock.calls[1]![0]).toContain('nope')
  })
})
