import * as v from 'valibot'

const BLANK = new RegExp('[\\s\\u200b-\\u200f\\u2028\\u2029\\u2060\\ufeff]', 'g')
const HEADER_SAFE = /^[!-~]+$/

export function normalizeToken(raw: string) {
  return raw.replace(BLANK, '').replace(/^Bearer/i, '')
}

export const playgroundTokenSchema = v.object({
  token: v.pipe(
    v.string('请粘贴 access token'),
    v.check(value => normalizeToken(value).length > 0, '请粘贴 access token'),
    v.check(
      value => HEADER_SAFE.test(normalizeToken(value)),
      '令牌含有无法放进请求头的字符，请重新复制',
    ),
  ),
})

export type PlaygroundTokenValues = v.InferOutput<typeof playgroundTokenSchema>
