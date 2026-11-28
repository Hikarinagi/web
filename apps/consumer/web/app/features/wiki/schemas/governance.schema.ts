import * as v from 'valibot'

const reason = v.pipe(
  v.string(issueMessage('validation.wiki.reasonType')),
  v.trim(),
  v.nonEmpty(issueMessage('validation.wiki.reasonRequired')),
  v.maxLength(500, issueMessage('validation.wiki.reasonMax')),
)

export const protectSchema = v.object({
  reason,
  until: v.nullish(v.string(issueMessage('validation.wiki.untilType')), null),
})

export const reasonSchema = v.object({ reason })

export type ProtectValues = v.InferOutput<typeof protectSchema>
export type ReasonValues = v.InferOutput<typeof reasonSchema>
