import { describe, expect, it } from 'vitest'
import { readPageQuery } from '../../shared/utils/query'

describe('readPageQuery', () => {
  it('reads a positive integer page from route and BFF queries', () => {
    expect(readPageQuery({ page: '3' })).toBe(3)
    expect(readPageQuery({ page: 4 })).toBe(4)
    expect(readPageQuery({ page: ['5', '6'] })).toBe(5)
  })

  it('falls back to the first page for missing or invalid values', () => {
    expect(readPageQuery({})).toBe(1)
    expect(readPageQuery({ page: '0' })).toBe(1)
    expect(readPageQuery({ page: '-2' })).toBe(1)
    expect(readPageQuery({ page: '1.5' })).toBe(1)
    expect(readPageQuery({ page: 'not-a-page' })).toBe(1)
  })
})
