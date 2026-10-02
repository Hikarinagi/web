import { describe, expect, it } from 'vitest'
import { readIdParam, readPageQuery } from '../../shared/utils/query'

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

describe('readIdParam', () => {
  it('accepts a positive integer route id', () => {
    expect(readIdParam('42')).toBe(42)
    expect(readIdParam(7)).toBe(7)
  })

  it('rejects anything that would reach the backend as NaN or a non-id', () => {
    expect(readIdParam(undefined)).toBeNull()
    expect(readIdParam('')).toBeNull()
    expect(readIdParam('NaN')).toBeNull()
    expect(readIdParam('undefined')).toBeNull()
    expect(readIdParam('0')).toBeNull()
    expect(readIdParam('-3')).toBeNull()
    expect(readIdParam('1.5')).toBeNull()
    expect(readIdParam('1e3')).toBeNull()
    expect(readIdParam(' 12 ')).toBeNull()
    expect(readIdParam('12abc')).toBeNull()
    expect(readIdParam(Number.NaN)).toBeNull()
  })
})
