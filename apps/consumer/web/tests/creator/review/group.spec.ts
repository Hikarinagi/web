import { describe, expect, it } from 'vitest'
import { groupByBatch } from '../../../server/utils/review-queue'

type Item = Parameters<typeof groupByBatch>[0][number]

function item(id: number, resource_type: string, batch_id: string | null): Item {
  return { id, resource_type, batch_id } as Item
}

describe('groupByBatch', () => {
  it('keeps unbatched CRs as standalone entries in order', () => {
    const entries = groupByBatch([item(3, 'GALGAME', null), item(2, 'TAG', null)])
    expect(entries.map(e => e.id)).toEqual([3, 2])
    expect(entries.every(e => e.bundled.length === 0)).toBe(true)
  })

  it('collapses a batch into one entry with the work CR as primary', () => {
    const entries = groupByBatch([
      item(10, 'GALGAME', 'b1'),
      item(9, 'PERSON', 'b1'),
      item(8, 'TAG', 'b1'),
      item(7, 'CHARACTER', null),
    ])
    expect(entries).toHaveLength(2)
    expect(entries[0]!.primary.id).toBe(10)
    expect(entries[0]!.bundled.map(m => m.id)).toEqual([9, 8])
    expect(entries[1]!.primary.id).toBe(7)
  })

  it('promotes a later work CR to primary when entities come first', () => {
    const entries = groupByBatch([
      item(9, 'PERSON', 'b1'),
      item(8, 'TAG', 'b1'),
      item(10, 'LIGHT_NOVEL_VOLUME', 'b1'),
    ])
    expect(entries).toHaveLength(1)
    expect(entries[0]!.id).toBe(10)
    expect(entries[0]!.primary.resource_type).toBe('LIGHT_NOVEL_VOLUME')
    expect(entries[0]!.bundled.map(m => m.id)).toEqual([8, 9])
  })

  it('keeps separate batches separate', () => {
    const entries = groupByBatch([
      item(10, 'GALGAME', 'b1'),
      item(9, 'LIGHT_NOVEL', 'b2'),
      item(8, 'PERSON', 'b1'),
      item(7, 'PRODUCER', 'b2'),
    ])
    expect(entries.map(e => e.id)).toEqual([10, 9])
    expect(entries[0]!.bundled.map(m => m.id)).toEqual([8])
    expect(entries[1]!.bundled.map(m => m.id)).toEqual([7])
  })
})
