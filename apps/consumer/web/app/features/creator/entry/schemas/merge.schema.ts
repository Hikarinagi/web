import * as v from 'valibot'

export const mergeSchema = v.object({
  note: v.pipe(v.string('说明应为文本'), v.trim(), v.nonEmpty('请说明两者为何相同')),
})

export type MergeValues = v.InferOutput<typeof mergeSchema>
