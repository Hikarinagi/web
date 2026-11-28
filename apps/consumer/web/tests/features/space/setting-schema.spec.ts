import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { profileSchema } from '../../../app/features/space/schemas/setting.schema'
import { usernameSchema } from '../../../app/features/user/schemas/username.schema'

describe('setting schemas', () => {
  it('reports the length limit from the language pack with the requirement filled in', () => {
    const result = v.safeParse(profileSchema, { nickname: 'x'.repeat(33), signature: '', bio: '' })
    expect(result.issues?.map(issue => issue.message)).toEqual(['昵称最多 32 个字'])
  })

  it('names the first failing username rule', () => {
    const message = (username: string) =>
      v.safeParse(usernameSchema, { username }).issues?.[0]?.message
    expect(message('ab')).toBe('用户名长度须为 3 到 20 个字符')
    expect(message('1234')).toBe('用户名不能是纯数字')
    expect(message('admin')).toBe('该用户名不可用')
    expect(message('hina_user')).toBeUndefined()
  })
})
