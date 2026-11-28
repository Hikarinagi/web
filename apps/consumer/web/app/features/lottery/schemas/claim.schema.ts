import * as v from 'valibot'

export const claimAccountSchema = v.object({
  account: v.pipe(
    v.string(issueMessage('validation.lottery.accountType')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.lottery.accountRequired')),
  ),
})

export type ClaimAccountValues = v.InferOutput<typeof claimAccountSchema>
