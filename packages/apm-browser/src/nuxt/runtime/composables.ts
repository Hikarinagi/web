import type { Apm } from '../../types.js'

export type ApmClient = Pick<Apm, 'track' | 'captureError' | 'identify'>

let client: Apm | undefined
let pendingUser: string | null | undefined

const silent: ApmClient = {
  track: () => undefined,
  captureError: () => undefined,
  identify: () => undefined,
}

const relay: ApmClient = {
  track: (name, attributes) => client?.track(name, attributes),
  captureError: (error, attributes) => client?.captureError(error, attributes),
  identify: id => {
    pendingUser = id
    client?.identify(id)
  },
}

export function installApm(apm: Apm): void {
  client = apm
  if (pendingUser !== undefined) apm.identify(pendingUser)
}

export function useApm(): ApmClient {
  if (import.meta.server) return silent
  return relay
}
