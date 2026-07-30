import { describe, expect, it } from 'vitest'
import { pageTokens } from '../../../app/components/ui/paginator/pages'

describe('pageTokens', () => {
  it('keeps the token count stable across edge and middle pages', () => {
    const pages = [1, 2, 4, 5, 10, 18, 20]
    const tokens = pages.map(page => pageTokens(page, 20, 1, 1))

    expect(tokens.map(items => items.length)).toEqual([7, 7, 7, 7, 7, 7, 7])
    expect(tokens[0]).toEqual([1, 2, 3, 4, 5, 'gap-end', 20])
    expect(tokens[3]).toEqual([1, 'gap-start', 4, 5, 6, 'gap-end', 20])
    expect(tokens[6]).toEqual([1, 'gap-start', 16, 17, 18, 19, 20])
  })

  it('returns every page when the total fits the configured window', () => {
    expect(pageTokens(1, 5, 1, 1)).toEqual([1, 2, 3, 4, 5])
  })
})
