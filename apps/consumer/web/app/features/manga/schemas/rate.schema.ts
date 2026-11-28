import * as v from 'valibot'

export const mangaRateSchema = v.object({
  status: v.picklist(
    ['GOING', 'COMPLETED', 'ON_HOLD', 'DROPPED'],
    issueMessage('validation.manga.statusRequired'),
  ),
  rate: v.nullish(
    v.pipe(
      v.number(issueMessage('validation.manga.rateRequired')),
      v.integer(issueMessage('validation.manga.rateInteger')),
      v.minValue(1, issueMessage('validation.manga.rateRange')),
      v.maxValue(10, issueMessage('validation.manga.rateRange')),
    ),
    null,
  ),
  rate_content: v.pipe(
    v.nullish(v.string(issueMessage('validation.manga.contentType')), ''),
    v.trim(),
    v.maxLength(2000, issueMessage('validation.manga.contentMax')),
  ),
  is_spoiler: v.optional(v.boolean(), false),
  status_private: v.optional(v.boolean(), false),
})

export type MangaRateValues = v.InferOutput<typeof mangaRateSchema>
