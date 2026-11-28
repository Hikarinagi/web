import * as v from 'valibot'

export function purchaseSchema(maxQuantity: number, price: number, balance: number) {
  return v.config(
    v.pipe(
      v.object({
        quantity: v.pipe(
          v.number(issueMessage('validation.purchase.quantityRequired')),
          v.integer(issueMessage('validation.purchase.quantityInteger')),
          v.minValue(1, issueMessage('validation.purchase.quantityMin')),
          v.maxValue(maxQuantity, issueMessage('validation.purchase.quantityMax')),
        ),
      }),
      v.check(
        values => values.quantity * price <= balance,
        issueMessage('validation.purchase.balanceInsufficient'),
      ),
    ),
    { abortPipeEarly: true },
  )
}

export type PurchaseValues = v.InferOutput<ReturnType<typeof purchaseSchema>>
