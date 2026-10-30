import * as v from 'valibot'

export const objectionSchema = v.object({
  reason: v.pipe(
    v.string('原因应为文本'),
    v.trim(),
    v.nonEmpty('请填写原因'),
    v.maxLength(1000, '原因不能超过 1000 字'),
  ),
})

export type ObjectionValues = v.InferOutput<typeof objectionSchema>
