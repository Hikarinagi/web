import {
  context,
  ROOT_CONTEXT,
  SpanKind,
  SpanStatusCode,
  trace,
  type Span,
} from '@opentelemetry/api'
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  type InstrumentationConfig,
} from '@opentelemetry/instrumentation'

import { ATTR_ENTRY, ATTR_ENTRY_NAME, SCOPE } from './entry'

const WRAPPED = Symbol.for('hikarinagi.apm.schedule')
const VERSIONS = ['>=4.0.0 <7']

type Tick = (this: unknown, ...args: unknown[]) => unknown
type Marked = Tick & { [WRAPPED]?: true }

interface Explorer {
  wrapFunctionInTryCatchBlocks(methodRef: Tick, instance: object): Tick
}

interface CronJobLike {
  fireOnTick: () => unknown
  _callbacks?: Marked[]
}

interface Registry {
  addCronJob(name: string, job: CronJobLike): unknown
}

export function tick<T extends Tick>(name: string, fn: T): T {
  const wrapped: Marked = function (this: unknown, ...args: unknown[]) {
    const span = trace.getTracer(SCOPE).startSpan(
      `schedule ${name}`,
      {
        kind: SpanKind.INTERNAL,
        attributes: { [ATTR_ENTRY]: 'schedule', [ATTR_ENTRY_NAME]: name },
      },
      ROOT_CONTEXT,
    )
    return context.with(trace.setSpan(ROOT_CONTEXT, span), () => {
      let result: unknown
      try {
        result = fn.apply(this, args)
      } catch (error) {
        fail(span, error)
        span.end()
        throw error
      }
      if (isThenable(result)) {
        return result.then(
          value => {
            span.end()
            return value
          },
          (error: unknown) => {
            fail(span, error)
            span.end()
            throw error
          },
        )
      }
      span.end()
      return result
    })
  }
  wrapped[WRAPPED] = true
  return wrapped as unknown as T
}

export function nameOf(instance: object, method: Tick): string {
  const prototype = Object.getPrototypeOf(instance) as Record<string, unknown> | null
  const key = prototype
    ? Object.getOwnPropertyNames(prototype).find(
        name => name !== 'constructor' && prototype[name] === method,
      )
    : undefined
  const owner = (instance.constructor as { name?: string } | undefined)?.name
  const member = key ?? (method.name || 'tick')
  return owner ? `${owner}.${member}` : member
}

export class NestScheduleInstrumentation extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super(`${SCOPE}/nest-schedule`, '0.0.0', config)
  }

  protected init() {
    return new InstrumentationNodeModuleDefinition(
      '@nestjs/schedule',
      VERSIONS,
      undefined,
      undefined,
      [
        new InstrumentationNodeModuleFile(
          '@nestjs/schedule/dist/schedule.explorer.js',
          VERSIONS,
          moduleExports => {
            const target = (moduleExports as { ScheduleExplorer: { prototype: Explorer } })
              .ScheduleExplorer.prototype
            this._wrap(target, 'wrapFunctionInTryCatchBlocks', original => {
              return function (this: Explorer, methodRef: Tick, instance: object) {
                const guarded: Marked = original.call(
                  this,
                  tick(nameOf(instance, methodRef), methodRef),
                  instance,
                )
                guarded[WRAPPED] = true
                return guarded
              }
            })
            return moduleExports
          },
          moduleExports => {
            const target = (moduleExports as { ScheduleExplorer: { prototype: Explorer } })
              .ScheduleExplorer.prototype
            this._unwrap(target, 'wrapFunctionInTryCatchBlocks')
          },
        ),
        new InstrumentationNodeModuleFile(
          '@nestjs/schedule/dist/scheduler.registry.js',
          VERSIONS,
          moduleExports => {
            const target = (moduleExports as { SchedulerRegistry: { prototype: Registry } })
              .SchedulerRegistry.prototype
            this._wrap(target, 'addCronJob', original => {
              return function (this: Registry, name: string, job: CronJobLike) {
                const callbacks = job._callbacks
                if (Array.isArray(callbacks)) {
                  if (!callbacks.some(callback => callback[WRAPPED])) {
                    job._callbacks = callbacks.map(callback => tick(name, callback))
                  }
                } else {
                  job.fireOnTick = tick(name, job.fireOnTick.bind(job))
                }
                return original.call(this, name, job)
              }
            })
            return moduleExports
          },
          moduleExports => {
            const target = (moduleExports as { SchedulerRegistry: { prototype: Registry } })
              .SchedulerRegistry.prototype
            this._unwrap(target, 'addCronJob')
          },
        ),
      ],
    )
  }
}

function fail(span: Span, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  if (error instanceof Error) span.recordException(error)
  span.setStatus({ code: SpanStatusCode.ERROR, message })
}

function isThenable(value: unknown): value is Promise<unknown> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}
