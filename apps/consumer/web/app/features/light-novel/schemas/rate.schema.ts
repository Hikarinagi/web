import * as v from 'valibot'

const dimension = v.nullish(
  v.pipe(
    v.number(issueMessage('validation.lightNovel.dimensionType')),
    v.integer(issueMessage('validation.lightNovel.dimensionInteger')),
    v.minValue(1, issueMessage('validation.lightNovel.dimensionRange')),
    v.maxValue(10, issueMessage('validation.lightNovel.dimensionRange')),
  ),
  null,
)

const hours = v.nullish(
  v.pipe(
    v.number(issueMessage('validation.lightNovel.hoursType')),
    v.minValue(0, issueMessage('validation.lightNovel.hoursMin')),
    v.maxValue(9999, issueMessage('validation.lightNovel.hoursMax')),
  ),
  null,
)

export const lightNovelRateSchema = v.object({
  status: v.picklist(
    ['GOING', 'COMPLETED', 'ON_HOLD', 'DROPPED'],
    issueMessage('validation.lightNovel.statusRequired'),
  ),
  rate: v.nullish(
    v.pipe(
      v.number(issueMessage('validation.lightNovel.rateRequired')),
      v.integer(issueMessage('validation.lightNovel.rateInteger')),
      v.minValue(1, issueMessage('validation.lightNovel.rateRange')),
      v.maxValue(10, issueMessage('validation.lightNovel.rateRange')),
    ),
    null,
  ),
  rate_content: v.pipe(
    v.nullish(v.string(issueMessage('validation.lightNovel.contentType')), ''),
    v.trim(),
    v.maxLength(2000, issueMessage('validation.lightNovel.contentMax')),
  ),
  time_to_finish_hours: hours,
  is_spoiler: v.optional(v.boolean(), false),
  status_private: v.optional(v.boolean(), false),
  rate_plot: dimension,
  rate_character: dimension,
  rate_writing: dimension,
  rate_worldview: dimension,
  rate_pacing: dimension,
  rate_illustration: dimension,
})

export type LightNovelRateValues = v.InferOutput<typeof lightNovelRateSchema>
