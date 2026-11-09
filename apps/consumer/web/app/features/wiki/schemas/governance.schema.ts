import * as v from 'valibot'

const reason = v.pipe(
  v.string('理由应为文本'),
  v.trim(),
  v.nonEmpty('请写明理由'),
  v.maxLength(500, '理由不能超过 500 字'),
)

export const protectSchema = v.object({
  reason,
  until: v.nullish(v.string('到期日应为文本'), null),
})

export const reasonSchema = v.object({ reason })

export type ProtectValues = v.InferOutput<typeof protectSchema>
export type ReasonValues = v.InferOutput<typeof reasonSchema>
