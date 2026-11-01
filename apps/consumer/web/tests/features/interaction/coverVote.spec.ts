import { describe, expect, it } from 'vitest'
import {
  toCoverCandidates,
  type CoverCandidate,
  type CoverVoteState,
} from '../../../app/features/interaction/useCoverVote'

function cover(id: number, votes: number): CoverCandidate {
  return { votes, media: { id, src: `/${id}.webp` } } as unknown as CoverCandidate
}

describe('toCoverCandidates', () => {
  it('orders by media id, independent of vote counts', () => {
    const covers = [cover(30, 1), cover(10, 99), cover(20, 50)]
    const state: CoverVoteState = { my_media_id: null, covers: [] }
    const out = toCoverCandidates(covers, state)
    expect(out.map(candidate => candidate.media.id)).toEqual([10, 20, 30])
  })

  it('takes vote counts from the override tally, falling back to the cover value', () => {
    const covers = [cover(10, 1), cover(20, 2)]
    const state: CoverVoteState = { my_media_id: null, covers: [{ media_id: 10, votes: 5 }] }
    const out = toCoverCandidates(covers, state)
    expect(out.find(candidate => candidate.media.id === 10)?.votes).toBe(5)
    expect(out.find(candidate => candidate.media.id === 20)?.votes).toBe(2)
  })

  it('flags the cover the viewer voted for via my_media_id', () => {
    const covers = [cover(10, 0), cover(20, 0)]
    const state: CoverVoteState = { my_media_id: 20, covers: [] }
    const out = toCoverCandidates(covers, state)
    expect(out.find(candidate => candidate.media.id === 10)?.mine).toBe(false)
    expect(out.find(candidate => candidate.media.id === 20)?.mine).toBe(true)
  })
})
