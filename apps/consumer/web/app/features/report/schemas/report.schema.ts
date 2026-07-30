import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'
import { REPORT_REASON_VALUES } from '../report'

const baseReportSchema = v.object({
  reason: v.picklist(REPORT_REASON_VALUES, '请选择举报原因'),
  description: v.pipe(
    v.nullish(v.string('补充说明应为文本'), ''),
    v.trim(),
    v.maxLength(500, '补充说明不能超过 500 个字符'),
  ),
})

export const reportSchema = v.pipe(
  baseReportSchema,
  v.forward(
    v.check(
      values => values.reason !== 'OTHER' || values.description.length > 0,
      '选择其他原因时请填写补充说明',
    ),
    ['description'],
  ),
)

export type ReportFormValues = v.InferOutput<typeof reportSchema>
export const reportResolver = valibotResolver(reportSchema)
