import * as v from 'valibot'

export const volumeRateSchema = v.object({
  rate: v.pipe(
    v.nullish(v.number('给个评分'), null),
    v.check(value => value !== null, '给个评分'),
    v.check(value => value === null || Number.isInteger(value), '请打整数分'),
    v.check(value => value === null || (value >= 1 && value <= 10), '评分需 1-10'),
  ),
  rate_content: v.pipe(
    v.nullish(v.string('短评应为文本'), ''),
    v.trim(),
    v.maxLength(2000, '短评不能超过 2000 字'),
  ),
  is_spoiler: v.optional(v.boolean(), false),
})

export type VolumeRateValues = v.InferOutput<typeof volumeRateSchema>
