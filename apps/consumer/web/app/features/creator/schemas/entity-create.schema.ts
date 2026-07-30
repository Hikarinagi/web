import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const entityCreateSchema = v.object({
  name: v.pipe(v.string('名称应为文本'), v.trim(), v.nonEmpty('请输入名称')),
})

export const producerCreateSchema = v.object({
  name: v.pipe(v.string('名称应为文本'), v.trim(), v.nonEmpty('请输入名称')),
  country: v.pipe(v.string('国家 / 地区应为文本'), v.trim(), v.nonEmpty('请输入国家 / 地区')),
})

export type EntityCreateValues = v.InferOutput<typeof entityCreateSchema>
export type ProducerCreateValues = v.InferOutput<typeof producerCreateSchema>

export const entityCreateResolver = valibotResolver(entityCreateSchema)
export const producerCreateResolver = valibotResolver(producerCreateSchema)
