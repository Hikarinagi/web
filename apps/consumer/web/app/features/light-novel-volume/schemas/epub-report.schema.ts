import * as v from 'valibot'
import { EPUB_REPORT_REASON_VALUES } from '../epub-report'

const baseEpubReportSchema = v.object({
  reason: v.picklist(
    EPUB_REPORT_REASON_VALUES,
    issueMessage('validation.lightNovelVolume.reasonRequired'),
  ),
  description: v.pipe(
    v.nullish(v.string(issueMessage('validation.lightNovelVolume.descriptionType')), ''),
    v.trim(),
    v.maxLength(500, issueMessage('validation.lightNovelVolume.descriptionMax')),
  ),
})

export const epubReportSchema = v.pipe(
  baseEpubReportSchema,
  v.forward(
    v.check(
      values => values.reason !== 'OTHER' || values.description.length > 0,
      issueMessage('validation.lightNovelVolume.descriptionRequired'),
    ),
    ['description'],
  ),
)

export type EpubReportFormValues = v.InferOutput<typeof epubReportSchema>
