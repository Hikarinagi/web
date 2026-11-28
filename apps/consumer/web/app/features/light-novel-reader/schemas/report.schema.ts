import * as v from 'valibot'

export const renderReportSchema = v.object({
  note: v.pipe(
    v.nullish(v.string(issueMessage('validation.lightNovelReader.noteType')), ''),
    v.trim(),
    v.maxLength(1000, issueMessage('validation.lightNovelReader.noteMax')),
  ),
})
export type RenderReportValues = v.InferOutput<typeof renderReportSchema>
