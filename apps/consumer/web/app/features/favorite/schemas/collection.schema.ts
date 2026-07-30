import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const collectionSchema = v.object({
  name: v.pipe(
    v.string('收藏夹名称应为文本'),
    v.trim(),
    v.nonEmpty('请输入收藏夹名称'),
    v.maxLength(255, '收藏夹名称不能超过 255 个字符'),
  ),
  description: v.pipe(
    v.nullish(v.string('简介应为文本'), ''),
    v.trim(),
    v.maxLength(2000, '简介不能超过 2000 个字符'),
  ),
  is_private: v.nullish(v.boolean('设为私密应为布尔值'), false),
})

export type CollectionValues = v.InferOutput<typeof collectionSchema>
export const collectionResolver = valibotResolver(collectionSchema)
