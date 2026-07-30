import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'
import { EPUB_REPORT_REASON_VALUES } from '../epub-report'

const baseEpubReportSchema = v.object({
  reason: v.picklist(EPUB_REPORT_REASON_VALUES, '请选择问题类型'),
  description: v.pipe(
    v.nullish(v.string('补充说明应为文本'), ''),
    v.trim(),
    v.maxLength(500, '补充说明不能超过 500 个字符'),
  ),
})

export const epubReportSchema = v.pipe(
  baseEpubReportSchema,
  v.forward(
    v.check(
      values => values.reason !== 'OTHER' || values.description.length > 0,
      '选择「其他」时请填写补充说明',
    ),
    ['description'],
  ),
)

export type EpubReportFormValues = v.InferOutput<typeof epubReportSchema>
export const epubReportResolver = valibotResolver(epubReportSchema)
