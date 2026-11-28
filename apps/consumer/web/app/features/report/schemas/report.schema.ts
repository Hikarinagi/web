import * as v from 'valibot'
import { REPORT_REASON_VALUES } from '../report'

const baseReportSchema = v.object({
  reason: v.picklist(REPORT_REASON_VALUES, issueMessage('validation.report.reasonRequired')),
  description: v.pipe(
    v.nullish(v.string(issueMessage('validation.report.descriptionType')), ''),
    v.trim(),
    v.maxLength(500, issueMessage('validation.report.descriptionMax')),
  ),
})

export const reportSchema = v.pipe(
  baseReportSchema,
  v.forward(
    v.check(
      values => values.reason !== 'OTHER' || values.description.length > 0,
      issueMessage('validation.report.descriptionRequired'),
    ),
    ['description'],
  ),
)

export type ReportFormValues = v.InferOutput<typeof reportSchema>
