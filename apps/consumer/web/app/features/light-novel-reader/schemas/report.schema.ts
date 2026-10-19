import * as v from 'valibot'

export const renderReportSchema = v.object({
  note: v.pipe(
    v.nullish(v.string('问题描述应为文本'), ''),
    v.trim(),
    v.maxLength(1000, '问题描述不能超过 1000 字'),
  ),
})
export type RenderReportValues = v.InferOutput<typeof renderReportSchema>
