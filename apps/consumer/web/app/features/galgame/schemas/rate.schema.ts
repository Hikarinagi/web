import * as v from 'valibot'

const dimension = v.nullish(
  v.pipe(
    v.number(issueMessage('validation.galgame.dimensionType')),
    v.integer(issueMessage('validation.galgame.dimensionInteger')),
    v.minValue(1, issueMessage('validation.galgame.dimensionRange')),
    v.maxValue(10, issueMessage('validation.galgame.dimensionRange')),
  ),
  null,
)

const hours = v.nullish(
  v.pipe(
    v.number(issueMessage('validation.galgame.hoursType')),
    v.minValue(0, issueMessage('validation.galgame.hoursMin')),
    v.maxValue(9999, issueMessage('validation.galgame.hoursMax')),
  ),
  null,
)

export const galgameRateSchema = v.object({
  status: v.picklist(
    ['GOING', 'COMPLETED', 'ON_HOLD', 'DROPPED'],
    issueMessage('validation.galgame.statusRequired'),
  ),
  rate: v.nullish(
    v.pipe(
      v.number(issueMessage('validation.galgame.rateRequired')),
      v.integer(issueMessage('validation.galgame.rateInteger')),
      v.minValue(1, issueMessage('validation.galgame.rateRange')),
      v.maxValue(10, issueMessage('validation.galgame.rateRange')),
    ),
    null,
  ),
  rate_content: v.pipe(
    v.nullish(v.string(issueMessage('validation.galgame.contentType')), ''),
    v.trim(),
    v.maxLength(2000, issueMessage('validation.galgame.contentMax')),
  ),
  time_to_finish_hours: hours,
  is_spoiler: v.optional(v.boolean(), false),
  status_private: v.optional(v.boolean(), false),
  rate_scenario: dimension,
  rate_direction: dimension,
  rate_music: dimension,
  rate_visual: dimension,
  rate_character: dimension,
  rate_system: dimension,
})

export type GalgameRateValues = v.InferOutput<typeof galgameRateSchema>
