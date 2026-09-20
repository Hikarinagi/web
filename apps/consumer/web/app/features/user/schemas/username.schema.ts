import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  isReservedUsername,
} from '@hikarinagi/shared'
import * as v from 'valibot'

export const usernameSchema = v.object({
  username: v.pipe(
    v.string('用户名应为文本'),
    v.trim(),
    v.nonEmpty('请输入新的用户名'),
    v.minLength(USERNAME_MIN_LENGTH, `用户名至少 ${USERNAME_MIN_LENGTH} 个字符`),
    v.maxLength(USERNAME_MAX_LENGTH, `用户名最多 ${USERNAME_MAX_LENGTH} 个字符`),
    v.regex(USERNAME_PATTERN, '只能包含字母、数字和下划线'),
    v.check(value => !/^\d+$/.test(value), '用户名不能是纯数字'),
    v.check(value => !isReservedUsername(value), '该用户名不可用'),
  ),
})
export const usernameResolver = valibotResolver(usernameSchema)
export type UsernameValues = v.InferOutput<typeof usernameSchema>
