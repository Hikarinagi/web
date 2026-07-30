import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'
import { EMOJI_SET_NAME_REGEX } from '../constants'

export const setCreateSchema = v.object({
  name: v.pipe(
    v.string('请输入贴纸包名称'),
    v.trim(),
    v.nonEmpty('请输入贴纸包名称'),
    v.regex(EMOJI_SET_NAME_REGEX, '名称必须为 2-16 个字母/数字/下划线/连字符,且全局唯一不可改'),
  ),
  visibility: v.picklist(['PUBLIC', 'PRIVATE'], '请选择可见性'),
})
export type SetCreateValues = v.InferOutput<typeof setCreateSchema>
export const setCreateResolver = valibotResolver(setCreateSchema)
