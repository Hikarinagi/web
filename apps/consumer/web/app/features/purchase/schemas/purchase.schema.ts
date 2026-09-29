import * as v from 'valibot'

export function purchaseSchema(maxQuantity: number, price: number, balance: number) {
  return v.config(
    v.pipe(
      v.object({
        quantity: v.pipe(
          v.number('请输入购买数量'),
          v.integer('购买数量须为整数'),
          v.minValue(1, '购买数量不能小于 1'),
          v.maxValue(maxQuantity, `购买数量不能超过 ${maxQuantity}`),
        ),
      }),
      v.check(values => values.quantity * price <= balance, '光点不足'),
    ),
    { abortPipeEarly: true },
  )
}

export type PurchaseValues = v.InferOutput<ReturnType<typeof purchaseSchema>>
