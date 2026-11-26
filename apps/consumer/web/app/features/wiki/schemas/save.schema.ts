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

export const evidenceSchema = v.record(
  v.string('作废依据应为文本'),
  v.object({
    reason: v.picklist(['CONTRADICTED', 'WRONG_ENTRY'], '作废原因不正确'),
    url: v.pipe(
      v.string('网址应为文本'),
      v.trim(),
      v.nonEmpty('请填写来源网址'),
      v.maxLength(2000, '网址不能超过 2000 个字符'),
      v.check(value => !value || /^https?:\/\//i.test(value), '网址应以 http:// 或 https:// 开头'),
    ),
    excerpt: v.pipe(
      v.string('摘录应为文本'),
      v.trim(),
      v.nonEmpty('请填写摘录'),
      v.maxLength(5000, '摘录不能超过 5000 字'),
    ),
  }),
)

export type EvidenceValues = v.InferOutput<typeof evidenceSchema>
