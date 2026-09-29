import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { purchaseSchema } from '../../../app/features/purchase/schemas/purchase.schema'

describe('purchase schema', () => {
  it.each([
    [null, '请输入购买数量'],
    [undefined, '请输入购买数量'],
    [NaN, '请输入购买数量'],
    [0, '购买数量不能小于 1'],
    [-1, '购买数量不能小于 1'],
    [1.5, '购买数量须为整数'],
    [11, '购买数量不能超过 10'],
  ])('reports a quantity error for %s even with no balance', (quantity, message) => {
    const result = v.safeParse(purchaseSchema(10, 6, 0), { quantity })
    expect(result.success).toBe(false)
    expect(result.issues?.map(issue => issue.message)).toEqual([message])
    expect(result.issues?.[0]?.path?.map(item => item.key)).toEqual(['quantity'])
  })

  it('reports insufficient points separately from quantity errors', () => {
    const result = v.safeParse(purchaseSchema(10, 6, 5), { quantity: 1 })
    expect(result.success).toBe(false)
    expect(result.issues?.map(issue => issue.message)).toEqual(['光点不足'])
    expect(result.issues?.[0]?.path).toBeUndefined()
  })

  it('accepts the maximum quantity when the balance exactly covers it', () => {
    expect(v.safeParse(purchaseSchema(10, 6, 60), { quantity: 10 }).success).toBe(true)
  })
})
