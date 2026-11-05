import * as v from 'valibot'

export const saveSchema = v.object({
  note: v.pipe(
    v.nullish(v.string('编辑说明应为文本'), ''),
    v.trim(),
    v.maxLength(500, '编辑说明不能超过 500 字'),
  ),
  url: v.pipe(
    v.nullish(v.string('网址应为文本'), ''),
    v.trim(),
    v.maxLength(2000, '网址不能超过 2000 个字符'),
    v.check(value => !value || /^https?:\/\//i.test(value), '网址应以 http:// 或 https:// 开头'),
  ),
})

export type SaveValues = v.InferOutput<typeof saveSchema>
