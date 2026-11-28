import * as v from 'valibot'

export const volumeRateSchema = v.object({
  rate: v.pipe(
    v.nullish(v.number(issueMessage('validation.lightNovelVolume.rateRequired')), null),
    v.check(value => value !== null, issueMessage('validation.lightNovelVolume.rateRequired')),
    v.check(
      value => value === null || Number.isInteger(value),
      issueMessage('validation.lightNovelVolume.rateInteger'),
    ),
    v.check(
      value => value === null || (value >= 1 && value <= 10),
      issueMessage('validation.lightNovelVolume.rateRange'),
    ),
  ),
  rate_content: v.pipe(
    v.nullish(v.string(issueMessage('validation.lightNovelVolume.contentType')), ''),
    v.trim(),
    v.maxLength(2000, issueMessage('validation.lightNovelVolume.contentMax')),
  ),
  is_spoiler: v.optional(v.boolean(), false),
})

export type VolumeRateValues = v.InferOutput<typeof volumeRateSchema>
