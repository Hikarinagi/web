import { useNuxtApp } from 'nuxt/app'

import type { Apm } from '../../types.js'

export type ApmClient = Pick<Apm, 'track' | 'captureError' | 'identify'>

const silent: ApmClient = {
  track: () => undefined,
  captureError: () => undefined,
  identify: () => undefined,
}

export function useApm(): ApmClient {
  if (import.meta.server) return silent
  return (useNuxtApp().$apm as Apm | undefined) ?? silent
}
