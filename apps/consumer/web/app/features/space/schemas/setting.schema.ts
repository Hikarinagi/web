import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const profileSchema = v.object({
  nickname: v.pipe(
    v.nullish(v.string('昵称应为文本'), ''),
    v.trim(),
    v.maxLength(32, '昵称最多 32 个字'),
  ),
  signature: v.pipe(
    v.nullish(v.string('个性签名应为文本'), ''),
    v.trim(),
    v.maxLength(120, '个性签名最多 120 个字'),
  ),
  bio: v.pipe(
    v.nullish(v.string('简介应为文本'), ''),
    v.trim(),
    v.maxLength(500, '简介最多 500 个字'),
  ),
})
export const profileResolver = valibotResolver(profileSchema)
export type ProfileValues = v.InferOutput<typeof profileSchema>

export const nicknameSchema = v.object({
  nickname: v.pipe(
    v.string('昵称应为文本'),
    v.trim(),
    v.nonEmpty('啊，你还什么都没有输入呢'),
    v.maxLength(32, '昵称最多 32 个字'),
  ),
})
export const nicknameResolver = valibotResolver(nicknameSchema)
export type NicknameValues = v.InferOutput<typeof nicknameSchema>
