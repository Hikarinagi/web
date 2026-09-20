import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

const URL_PATTERN = /^(https?:\/\/|\/)/i

export const linkSchema = v.object({
  url: v.pipe(
    v.string('URL 应为文本'),
    v.trim(),
    v.nonEmpty('请输入链接 URL'),
    v.check(value => URL_PATTERN.test(value), '链接需以 http(s):// 或 / 开头'),
  ),
  text: v.pipe(v.nullish(v.string('显示文字应为文本'), ''), v.trim()),
})

export type LinkValues = v.InferOutput<typeof linkSchema>

export const linkResolver = valibotResolver(linkSchema)
