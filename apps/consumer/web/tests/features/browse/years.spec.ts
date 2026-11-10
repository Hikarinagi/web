import { describe, expect, it } from 'vitest'
import { rangeText, readYears, writeYears, yearRanges } from '../../../app/features/browse/years'

describe('browse years', () => {
  it('reads ranges and single years from the address, ignoring junk and out-of-range years', () => {
    expect(readYears('2012-2010,2022,abc,1800,2022')).toEqual([2010, 2011, 2012, 2022])
    expect(readYears(['2001', '2003-2004'])).toEqual([2001, 2003, 2004])
    expect(readYears(undefined)).toEqual([])
  })

  it('writes contiguous years back as one range each', () => {
    expect(writeYears([2015, 2010, 2011, 2012, 2022])).toBe('2010-2012,2015,2022')
    expect(writeYears([])).toBeUndefined()
  })

  it('names each range for the condition chips', () => {
    expect(yearRanges([2010, 2011, 2015]).map(rangeText)).toEqual(['2010 至 2011 年', '2015 年'])
    expect(rangeText({ from: 1900, to: 1999 })).toBe('1999 年以前')
  })
})
