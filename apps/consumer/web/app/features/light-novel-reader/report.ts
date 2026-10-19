import type { ReadingPosition } from '@ritojs/kit'
import type { ReaderError } from './useReaderErrors'

export function buildReport(input: {
  version: string
  rito: { core: string; kit: string }
  position: ReadingPosition | null
  chapter: { title: string | null; href: string | null }
  spread: { current: number; total: number } | null
  viewport: { width: number; height: number; ratio: number }
  stage: { width: number; height: number }
  userAgent: string
  settings: Record<string, unknown>
  errors: readonly ReaderError[]
}) {
  return {
    client: 'web',
    app_version: input.version,
    rito: input.rito,
    chapter: input.chapter,
    current_spread: input.spread?.current ?? null,
    total_spreads: input.spread?.total ?? null,
    progress: input.position?.progress ?? null,
    source_locator: input.position?.sourceLocator ?? null,
    viewport: input.viewport,
    stage: input.stage,
    user_agent: input.userAgent,
    settings: input.settings,
    errors: input.errors,
  }
}
