import * as v from 'valibot'

export const structureSchema = v.object({
  note: v.pipe(v.string('原因应为文本'), v.trim(), v.nonEmpty('请填写原因')),
})

export type StructureValues = v.InferOutput<typeof structureSchema>
