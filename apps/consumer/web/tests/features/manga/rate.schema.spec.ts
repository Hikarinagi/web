import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { mangaRateSchema } from '../../../app/features/manga/schemas/rate.schema'

describe('mangaRateSchema', () => {
  it('accepts a manga rate', () => {
    const result = v.safeParse(mangaRateSchema, {
      status: 'COMPLETED',
      rate: 9,
      rate_content: '分镜极佳。',
      is_spoiler: false,
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.output.status).toBe('COMPLETED')
    expect(result.output.is_spoiler).toBe(false)
  })

  it('rejects an unknown status', () => {
    const result = v.safeParse(mangaRateSchema, { status: 'INVALID_STATUS', rate: 8 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.issues[0]?.message).toBe('选个状态')
  })
})
