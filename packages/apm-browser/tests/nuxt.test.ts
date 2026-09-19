import { describe, expect, it, vi } from 'vitest'

import { installApm, useApm } from '../src/nuxt/runtime/composables.js'
import type { Apm } from '../src/types.js'

function fakeApm(): Apm & { identified: Array<string | null>; tracked: string[] } {
  const identified: Array<string | null> = []
  const tracked: string[] = []
  return {
    identified,
    tracked,
    identify: id => void identified.push(id),
    track: name => void tracked.push(name),
    captureError: vi.fn(),
  } as unknown as Apm & { identified: Array<string | null>; tracked: string[] }
}

describe('useApm before and after the plugin is ready', () => {
  it('remembers the last identity and applies it once the client exists', () => {
    const client = useApm()
    client.identify('7')
    client.identify('42')
    client.track('too_early')
    const apm = fakeApm()
    installApm(apm)
    expect(apm.identified).toEqual(['42'])
    expect(apm.tracked).toEqual([])
    client.identify(null)
    client.track('page_view')
    expect(apm.identified).toEqual(['42', null])
    expect(apm.tracked).toEqual(['page_view'])
  })
})
