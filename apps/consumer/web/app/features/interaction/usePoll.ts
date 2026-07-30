import type { components } from '@hikarinagi/api-contract/v3'

type Poll = components['schemas']['PollResDto']

const overrideKey = (key: string) => `poll:${key}`

function pollOverrides() {
  return useState<Record<string, Poll>>('interaction:poll', () => ({}))
}

export function usePoll() {
  const overrides = pollOverrides()
  const busy = ref(false)

  function apply(key: string, poll: Poll) {
    overrides.value[overrideKey(key)] = poll
  }

  async function vote(key: string, id: number, optionIds: number[]) {
    if (busy.value) return
    busy.value = true
    try {
      const res = await hikariRequest<'/api/v3/polls/{id}/vote', 'post'>(
        '/api/v3/polls/{id}/vote',
        { method: 'post', path: { id }, body: { option_ids: optionIds } },
      )
      overrides.value[overrideKey(key)] = res
    } catch {
      /* empty */
    } finally {
      busy.value = false
    }
  }

  async function retract(key: string, id: number) {
    if (busy.value) return
    busy.value = true
    try {
      const res = await hikariRequest<'/api/v3/polls/{id}/vote', 'delete'>(
        '/api/v3/polls/{id}/vote',
        { method: 'delete', path: { id } },
      )
      overrides.value[overrideKey(key)] = res
    } catch {
      /* empty */
    } finally {
      busy.value = false
    }
  }

  return { vote, retract, apply, busy }
}

export function usePollView(key: string, fallback: () => Poll | null) {
  const overrides = pollOverrides()
  return computed<Poll | null>(() => overrides.value[overrideKey(key)] ?? fallback())
}
