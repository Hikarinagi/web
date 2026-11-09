import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLandingFeed } from '../../app/features/landing/useLandingFeed'

const item = (id: number) => ({ id, reason: { kind: 'HOT', ref: null } }) as never

describe('landing feed', () => {
  const request = vi.fn()

  beforeEach(() => {
    request.mockReset()
    vi.stubGlobal('hikariRequest', request)
    vi.stubGlobal('localStorage', { getItem: () => 'visitor-1', setItem: () => {} })
    vi.stubGlobal('document', { cookie: '' })
  })

  it('asks for the next batch with the cursor and visitor and appends it until the end', async () => {
    request
      .mockResolvedValueOnce({ items: [item(3), item(4)], cursor: 'token.2' })
      .mockResolvedValueOnce({ items: [item(5)], cursor: null })
    const feed = useLandingFeed('/api/v3/landing/galgames/feed', {
      items: [item(1), item(2)],
      cursor: 'token.1',
    })

    await feed.load()
    await feed.load()
    await feed.load()

    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls.map(call => call[1].query)).toEqual([
      { cursor: 'token.1', visitor: 'visitor-1' },
      { cursor: 'token.2', visitor: 'visitor-1' },
    ])
    expect(feed.items.value.map(entry => (entry as { id: number }).id)).toEqual([1, 2, 3, 4, 5])
    expect(feed.done.value).toBe(true)
  })

  it('keeps what it has and allows a retry after a failed request', async () => {
    request.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({
      items: [item(2)],
      cursor: null,
    })
    const feed = useLandingFeed('/api/v3/landing/mangas/feed', { items: [item(1)], cursor: 't.1' })

    await feed.load()
    expect(feed.failed.value).toBe(true)
    expect(feed.items.value).toHaveLength(1)

    await feed.load()
    expect(feed.failed.value).toBe(false)
    expect(feed.items.value).toHaveLength(2)
  })
})
